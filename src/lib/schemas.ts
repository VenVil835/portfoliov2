import { z } from 'zod';

/**
 * Zod Validation Schemas
 * 
 * All API input validation schemas are defined here.
 * These provide:
 * - Type-safe validation
 * - Automatic TypeScript type inference
 * - Clear error messages
 * - XSS prevention through strict patterns
 */

/**
 * Contact form submission schema
 * Validates name, email, message, and CSRF token
 */
export const contactSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .regex(
            /^[a-zA-Z\s\-'\.]+$/,
            'Name can only contain letters, spaces, hyphens, apostrophes, and periods'
        )
        .transform((val) => val.trim()),

    email: z
        .string()
        .email('Please enter a valid email address')
        .max(255, 'Email must be less than 255 characters')
        .toLowerCase()
        .transform((val) => val.trim()),

    message: z
        .string()
        .min(10, 'Message must be at least 10 characters')
        .max(5000, 'Message must be less than 5000 characters')
        .transform((val) => val.trim()),

    csrfToken: z
        .string()
        .min(1, 'Security token is required'),
});

/**
 * TypeScript type inferred from the schema
 */
export type ContactFormData = z.infer<typeof contactSchema>;

/**
 * GitHub username validation (for API params)
 */
export const githubUsernameSchema = z
    .string()
    .min(1)
    .max(39)
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/);

/**
 * Project category validation
 */
export const projectCategorySchema = z.enum(['video', 'photo', 'web', 'all']);
