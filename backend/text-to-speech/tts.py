import io
import os
import sys
from typing import Optional
import uuid
import re

import modal 
from pydantic import BaseModel 
import torch
import torchaudio
import boto3
from botocore.exceptions import ClientError, BotoCoreError
from twilio.rest import Client as TwilioClient
from twilio.base.exceptions import TwilioRestException

# Get Modal app name from environment, with fallback
MODAL_APP_NAME = os.environ.get("MODAL_APP_NAME", "doppel-center")
app = modal.App(MODAL_APP_NAME)

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("numpy==1.26.0", "torch==2.6.0")
    .pip_install_from_requirements("requirements.txt")
    .apt_install("ffmpeg")
)

# Get volume and secret names from environment, with fallbacks
HF_CACHE_VOLUME_NAME = os.environ.get("MODAL_HF_CACHE_VOLUME", f"hf-cache-{MODAL_APP_NAME}")
AWS_SECRET_NAME = os.environ.get("MODAL_AWS_SECRET_NAME", f"{MODAL_APP_NAME}-aws-secret")

volume = modal.Volume.from_name(HF_CACHE_VOLUME_NAME, create_if_missing=True)
s3_secret = modal.Secret.from_name(AWS_SECRET_NAME)

class TextToSpeechRequest(BaseModel):
    text: str
    voice_s3_key: Optional[str] = None
    language: str = "en"
    exaggeration: float = 0.5
    cfg_weight: float = 0.5
    # New fields for multi-provider support
    provider: str = "chatterbox"  # 'chatterbox' | 'twilio' | 'polly'
    voice_id: Optional[str] = None  # Provider-specific voice ID
    # Pass-through credentials (never stored)
    twilio_sid: Optional[str] = None
    twilio_auth: Optional[str] = None
    aws_access_key: Optional[str] = None
    aws_secret_key: Optional[str] = None
    aws_region: Optional[str] = "us-east-1"


class TextToSpeechResponse(BaseModel):
    success: bool
    s3_Key: Optional[str] = None
    audioUrl: Optional[str] = None
    provider: Optional[str] = None
    voiceId: Optional[str] = None
    duration: Optional[float] = None
    error: Optional[str] = None
    code: Optional[str] = None

# Get S3 bucket name from environment, with fallback
AWS_S3_BUCKET_NAME = os.environ.get("AWS_S3_BUCKET_NAME", MODAL_APP_NAME)

@app.cls(
    image=image,
    gpu="L40S",
    volumes={
        "/root/.cache/huppingface": volume,
        "/s3-mount": modal.CloudBucketMount(AWS_S3_BUCKET_NAME, secret=s3_secret)
    },
    scaledown_window=120,
    secrets=[s3_secret]
)
class TextToSpeachServer:
    @modal.enter()
    def load_model(self):
        # Only load Chatterbox model if needed (lazy loading per provider)
        self.model = None
        self.model_loaded = False

    def _load_chatterbox_model(self):
        """Lazy load Chatterbox model only when needed"""
        if not self.model_loaded:
            from chatterbox.mtl_tts import ChatterboxMultilingualTTS
            self.model = ChatterboxMultilingualTTS.from_pretrained(device="cuda")
            self.model_loaded = True

    def _validate_twilio_credentials(self, sid: str, auth: str) -> bool:
        """Validate Twilio credentials format and authenticity"""
        if not sid or not auth:
            return False
        
        # Validate format: SID starts with "AC" and is 34 chars
        if not sid.startswith("AC") or len(sid) != 34:
            return False
        
        # Auth token should be 32 chars
        if len(auth) != 32:
            return False
        
        try:
            client = TwilioClient(sid, auth)
            # Make a simple API call to validate
            client.api.accounts(sid).fetch()
            return True
        except TwilioRestException as e:
            if e.code == 20003:  # Invalid credentials
                return False
            raise
        except Exception:
            return False

    def _generate_twilio_tts(
        self, 
        text: str, 
        voice_id: str, 
        twilio_sid: str, 
        twilio_auth: str,
        aws_access_key: Optional[str],
        aws_secret_key: Optional[str],
        aws_region: str
    ) -> bytes:
        """
        Generate TTS using Twilio (which uses AWS Polly under the hood).
        Validates Twilio credentials first, then uses AWS Polly directly.
        """
        # Validate Twilio credentials
        if not self._validate_twilio_credentials(twilio_sid, twilio_auth):
            raise ValueError("Invalid Twilio credentials")
        
        # Parse voice ID: Format is "Polly.VoiceName-Engine" (e.g., "Polly.Joanna-Neural")
        voice_match = re.match(r"^Polly\.(\w+)-(\w+)$", voice_id)
        if not voice_match:
            raise ValueError(f"Invalid Twilio voice ID format: {voice_id}. Expected format: Polly.VoiceName-Engine")
        
        voice_name, engine = voice_match.groups()
        
        # Use AWS credentials from request, or fall back to environment
        polly_region = aws_region or os.environ.get("AWS_REGION", "us-east-1")
        
        polly_kwargs = {"region_name": polly_region}
        if aws_access_key and aws_secret_key:
            polly_kwargs["aws_access_key_id"] = aws_access_key
            polly_kwargs["aws_secret_access_key"] = aws_secret_key
        
        try:
            polly_client = boto3.client("polly", **polly_kwargs)
            
            response = polly_client.synthesize_speech(
                Engine=engine.lower(),
                OutputFormat="mp3",
                Text=text,
                VoiceId=voice_name,
                TextType="text"
            )
            
            # Read audio stream
            audio_bytes = response["AudioStream"].read()
            return audio_bytes
            
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "UNKNOWN")
            if error_code == "InvalidParameterException":
                raise ValueError(f"Invalid voice or text: {str(e)}")
            elif error_code in ["InvalidUserPoolConfigurationException", "NotAuthorizedException"]:
                raise ValueError("AWS credentials not configured or invalid")
            raise ValueError(f"AWS Polly error: {str(e)}")
        except BotoCoreError as e:
            raise ValueError(f"AWS service error: {str(e)}")

    def _generate_polly_tts(
        self,
        text: str,
        voice_id: str,
        aws_access_key: str,
        aws_secret_key: str,
        aws_region: str
    ) -> bytes:
        """Generate TTS using Amazon Polly directly"""
        if not aws_access_key or not aws_secret_key:
            raise ValueError("AWS credentials required for Polly provider")
        
        if not voice_id:
            raise ValueError("Voice ID required for Polly provider")
        
        try:
            polly_client = boto3.client(
                "polly",
                region_name=aws_region or "us-east-1",
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key
            )
            
            # Determine engine from voice ID if not specified
            # Some voices are neural, some are standard
            engine = "neural" if "neural" in voice_id.lower() or "generative" in voice_id.lower() else "standard"
            
            response = polly_client.synthesize_speech(
                Engine=engine,
                OutputFormat="mp3",
                Text=text,
                VoiceId=voice_id,
                TextType="text"
            )
            
            audio_bytes = response["AudioStream"].read()
            return audio_bytes
            
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "UNKNOWN")
            if error_code == "InvalidParameterException":
                raise ValueError(f"Invalid voice or text: {str(e)}")
            elif error_code in ["InvalidUserPoolConfigurationException", "NotAuthorizedException"]:
                raise ValueError("Invalid AWS credentials")
            raise ValueError(f"AWS Polly error: {str(e)}")
        except BotoCoreError as e:
            raise ValueError(f"AWS service error: {str(e)}")

    def _generate_chatterbox_tts(
        self,
        text: str,
        voice_s3_key: Optional[str],
        language: str,
        exaggeration: float,
        cfg_weight: float
    ) -> bytes:
        """Generate TTS using Chatterbox AI (existing implementation)"""
        self._load_chatterbox_model()
        
        with torch.no_grad():
            if voice_s3_key:
                audio_prompt_path = f"/s3-mount/{voice_s3_key}"
                if not os.path.exists(audio_prompt_path):
                    raise FileNotFoundError(f"Prompt audio not found at {audio_prompt_path}")
                wav = self.model.generate(
                    text,
                    audio_prompt_path=audio_prompt_path,
                    language_id=language,
                    exaggeration=exaggeration,
                    cfg_weight=cfg_weight
                )
            else:
                wav = self.model.generate(
                    text,
                    language_id=language,
                    exaggeration=exaggeration,
                    cfg_weight=cfg_weight
                )
            wav_cpu = wav.cpu()
        
        # Convert to WAV format bytes
        buffer = io.BytesIO()
        torchaudio.save(buffer, wav_cpu, self.model.sr, format="wav")
        buffer.seek(0)
        return buffer.read()

    def _save_to_s3(self, audio_bytes: bytes, extension: str = "wav") -> str:
        """Save audio bytes to S3 and return the S3 key"""
        audio_uuid = str(uuid.uuid4())
        s3_key = f"tts/{audio_uuid}.{extension}"
        s3_path = f"/s3-mount/{s3_key}"
        os.makedirs(os.path.dirname(s3_path), exist_ok=True)
        with open(s3_path, "wb") as f:
            f.write(audio_bytes)
        print(f"Saved audio to S3: {s3_key}")
        return s3_key

    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def generate_speech(self, request: TextToSpeechRequest) -> TextToSpeechResponse:
        """Main TTS generation endpoint with multi-provider support"""
        try:
            # Validate input
            if not request.text or not request.text.strip():
                return TextToSpeechResponse(
                    success=False,
                    error="Text is required",
                    code="MISSING_TEXT"
                )
            
            if len(request.text) > 3000:
                return TextToSpeechResponse(
                    success=False,
                    error="Text exceeds maximum length of 3000 characters",
                    code="TEXT_TOO_LONG"
                )
            
            provider = request.provider.lower() if request.provider else "chatterbox"
            audio_bytes = None
            file_extension = "wav"
            
            # Route to appropriate provider
            if provider == "twilio":
                if not request.twilio_sid or not request.twilio_auth:
                    return TextToSpeechResponse(
                        success=False,
                        error="Twilio credentials required",
                        code="MISSING_CREDENTIALS"
                    )
                if not request.voice_id:
                    return TextToSpeechResponse(
                        success=False,
                        error="Voice ID required for Twilio provider",
                        code="MISSING_VOICE_ID"
                    )
                try:
                    audio_bytes = self._generate_twilio_tts(
                        request.text,
                        request.voice_id,
                        request.twilio_sid,
                        request.twilio_auth,
                        request.aws_access_key,
                        request.aws_secret_key,
                        request.aws_region or "us-east-1"
                    )
                    file_extension = "mp3"  # Twilio/Polly returns MP3
                except ValueError as e:
                    return TextToSpeechResponse(
                        success=False,
                        error=str(e),
                        code="INVALID_CREDENTIALS" if "credential" in str(e).lower() else "PROVIDER_ERROR"
                    )
            
            elif provider == "polly":
                if not request.aws_access_key or not request.aws_secret_key:
                    return TextToSpeechResponse(
                        success=False,
                        error="AWS credentials required for Polly provider",
                        code="MISSING_CREDENTIALS"
                    )
                if not request.voice_id:
                    return TextToSpeechResponse(
                        success=False,
                        error="Voice ID required for Polly provider",
                        code="MISSING_VOICE_ID"
                    )
                try:
                    audio_bytes = self._generate_polly_tts(
                        request.text,
                        request.voice_id,
                        request.aws_access_key,
                        request.aws_secret_key,
                        request.aws_region or "us-east-1"
                    )
                    file_extension = "mp3"  # Polly returns MP3
                except ValueError as e:
                    return TextToSpeechResponse(
                        success=False,
                        error=str(e),
                        code="INVALID_CREDENTIALS" if "credential" in str(e).lower() else "PROVIDER_ERROR"
                    )
            
            else:  # chatterbox (default)
                try:
                    audio_bytes = self._generate_chatterbox_tts(
                        request.text,
                        request.voice_s3_key,
                        request.language,
                        request.exaggeration,
                        request.cfg_weight
                    )
                    file_extension = "wav"  # Chatterbox returns WAV
                except FileNotFoundError as e:
                    return TextToSpeechResponse(
                        success=False,
                        error=str(e),
                        code="FILE_NOT_FOUND"
                    )
                except Exception as e:
                    return TextToSpeechResponse(
                        success=False,
                        error=f"Chatterbox generation failed: {str(e)}",
                        code="PROVIDER_ERROR"
                    )
            
            # Save to S3
            s3_key = self._save_to_s3(audio_bytes, file_extension)
            
            # Return success response
            return TextToSpeechResponse(
                success=True,
                s3_Key=s3_key,
                provider=provider,
                voiceId=request.voice_id,
                # Duration calculation would require audio analysis - skip for now
                duration=None
            )
            
        except Exception as e:
            print(f"Unexpected error in generate_speech: {str(e)}", file=sys.stderr)
            return TextToSpeechResponse(
                success=False,
                error=f"Internal server error: {str(e)}",
                code="INTERNAL_ERROR"
            )
