/**
 * Email template configuration - single source of truth for all email templates.
 * Used by EmailTemplatesCard for admin testing. Backend uses same IDs.
 */
import { Shield, CreditCard, UserPlus, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface EmailTemplateConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
}

export const EMAIL_TEMPLATES: EmailTemplateConfig[] = [
  {
    id: 'verification',
    name: 'Email Verification',
    description: 'Sent to new users to verify their email address',
    icon: Shield,
    category: 'Authentication',
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Sent when users request a password reset',
    icon: Shield,
    category: 'Authentication',
  },
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent to users after email verification',
    icon: UserPlus,
    category: 'Onboarding',
  },
  {
    id: 'upgrade',
    name: 'Account Upgrade',
    description: 'Sent when users upgrade their subscription',
    icon: CreditCard,
    category: 'Billing',
  },
  {
    id: 'order-receipt',
    name: 'Order Receipt',
    description: 'Sent after successful payment',
    icon: CreditCard,
    category: 'Billing',
  },
  {
    id: 'invitation',
    name: 'User Invitation',
    description: 'Sent to invite new users to the platform',
    icon: Users,
    category: 'Social',
  },
];

export const EMAIL_TEMPLATE_IDS = EMAIL_TEMPLATES.map((t) => t.id) as [
  'verification',
  'password-reset',
  'welcome',
  'upgrade',
  'order-receipt',
  'invitation',
];
