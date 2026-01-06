import io
import os
import sys
from typing import Optional
import uuid

import modal 

from pydantic import BaseModel 

import torch
import torchaudio

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


class TextToSpeechResponse(BaseModel):
    s3_Key: str

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
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        self.model = ChatterboxMultilingualTTS.from_pretrained(device="cuda")

    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def generate_speech(self, request: TextToSpeechRequest) -> TextToSpeechResponse:
        with torch.no_grad():
            if request.voice_s3_key:
                audio_prompt_path = f"/s3-mount/{request.voice_s3_key}"

                if not os.path.exists(audio_prompt_path):
                    raise FileNotFoundError(
                        f"Prompt audio not found at {audio_prompt_path}")
                wav = self.model.generate(
                    request.text, 
                    audio_prompt_path=audio_prompt_path,
                    language_id=request.language,
                    exaggeration=request.exaggeration,
                    cfg_weight=request.cfg_weight
                )
            else:
                wav = self.model.generate(
                    request.text,
                    language_id=request.language,
                    exaggeration=request.exaggeration,
                    cfg_weight=request.cfg_weight
                )
            wav_cpu = wav.cpu()

        # Convert the audio tensor to WAV format bytes
        buffer = io.BytesIO()  # Create an in-memory buffer
        torchaudio.save(buffer, wav_cpu, self.model.sr, format="wav")  # Save as WAV
        buffer.seek(0)  # Reset buffer position to start
        audio_bytes = buffer.read()  # Read all bytes            


        audio_uuid = str(uuid.uuid4())  
        s3_key = f"tts/{audio_uuid}.wav"


        s3_path = f"/s3-mount/{s3_key}" 
        os.makedirs(os.path.dirname(s3_path), exist_ok=True)
        with open(s3_path, "wb") as f:
            f.write(audio_bytes)
        print(f"Saved audio to S3: {s3_key}")
        return TextToSpeechResponse(s3_Key=s3_key)
