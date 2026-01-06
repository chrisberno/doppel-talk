/**
 * Twilio Paste + Tailwind CSS Compatibility Guide
 * 
 * This file documents the hybrid approach for using Twilio Paste components
 * alongside Tailwind CSS utilities.
 * 
 * ## Component Usage Strategy
 * 
 * ### Use Twilio Paste For:
 * - Forms: Input, Select, Textarea, Checkbox, Radio
 * - Buttons: Button (all variants)
 * - Modals: Modal, ModalHeader, ModalBody, ModalFooter
 * - Alerts: Alert, AlertDialog
 * - Toasts: Toast (if needed, though we use Sonner currently)
 * - Data Display: Table, Card (Paste version)
 * - Navigation: Breadcrumb, Pagination
 * - Feedback: Spinner, Progress
 * 
 * ### Use Tailwind CSS For:
 * - Layout: flex, grid, gap-*, p-*, m-*, w-*, h-*
 * - Responsive: sm:, md:, lg:, xl: breakpoints
 * - Spacing utilities: All margin/padding classes
 * - Display: block, inline, hidden, etc.
 * - Positioning: relative, absolute, fixed, sticky
 * - Z-index: z-10, z-20, etc.
 * 
 * ### Avoid Conflicts:
 * - Don't use Tailwind for colors on Paste components (use Paste's color props)
 * - Don't use Tailwind for typography on Paste components (use Paste's typography props)
 * - Don't use Tailwind for form styling (use Paste form components)
 * - Don't use Tailwind buttons (use Paste Button component)
 * 
 * ## Example Patterns
 * 
 * ```tsx
 * // ✅ Good: Paste component with Tailwind layout
 * import { Button } from '@twilio-paste/core/button';
 * import { Box } from '@twilio-paste/core/box';
 * 
 * <Box display="flex" gap="space40" padding="space60">
 *   <Button variant="primary">Submit</Button>
 *   <Button variant="secondary">Cancel</Button>
 * </Box>
 * 
 * // ✅ Also good: Tailwind for layout, Paste for components
 * <div className="flex gap-4 p-6">
 *   <Button variant="primary">Submit</Button>
 *   <Button variant="secondary">Cancel</Button>
 * </div>
 * 
 * // ❌ Bad: Mixing Tailwind styling with Paste components
 * <Button className="bg-blue-500 text-white">Submit</Button>
 * 
 * // ✅ Good: Use Paste's variant system
 * <Button variant="primary">Submit</Button>
 * ```
 * 
 * ## Migration Strategy
 * 
 * 1. Start with highest-impact pages (TTS form, voice browser)
 * 2. Replace form elements first (Input, Select, Button)
 * 3. Replace modals and alerts
 * 4. Keep Tailwind for layout and spacing
 * 5. Gradually migrate remaining components
 * 
 * ## Import Patterns
 * 
 * ```tsx
 * // Individual component imports (recommended for tree-shaking)
 * import { Button } from '@twilio-paste/core/button';
 * import { Input } from '@twilio-paste/core/input';
 * import { Select, Option } from '@twilio-paste/core/select';
 * import { Modal, ModalHeader, ModalBody } from '@twilio-paste/core/modal';
 * 
 * // Box and Stack for layout (can use Tailwind instead)
 * import { Box } from '@twilio-paste/core/box';
 * import { Stack } from '@twilio-paste/core/stack';
 * ```
 */

export {};
