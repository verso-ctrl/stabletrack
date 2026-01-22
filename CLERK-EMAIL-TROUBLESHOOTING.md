# Clerk Email Verification Troubleshooting Guide

This guide helps resolve issues with email verification codes not being sent during sign-up.

---

## Problem

Users are not receiving email verification codes when signing up for StableTrack.

---

## Root Cause

StableTrack uses [Clerk](https://clerk.com) for authentication. Email verification is handled entirely by Clerk, not by custom application code. If emails aren't being sent, it's a Clerk configuration issue.

---

## Solution Steps

### Step 1: Check Clerk Dashboard Email Settings

1. **Log in to Clerk Dashboard**
   - Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
   - Select your StableTrack application

2. **Verify Email Address Settings**
   - Navigate to: **User & Authentication** → **Email, Phone, Username**
   - Ensure **Email address** is:
     - ✅ **Enabled**
     - ✅ Set to **Required**
   - Save changes if you made any modifications

3. **Check Verification Settings**
   - Navigate to: **User & Authentication** → **Verification**
   - Ensure **Email verification** is:
     - ✅ **Enabled**
     - Verification method: **Email code** (6-digit code) or **Email link**
   - Save changes if modified

4. **Review Email Provider Configuration**
   - Navigate to: **Customization** → **Emails** (or **Email & SMS**)
   - Check the **Email Provider** section
   - You should see one of:
     - **Clerk (shared)** - Default option, works for development
     - **Custom provider** - If you've configured SendGrid, Resend, etc.

---

### Step 2: Verify Email Provider Status

#### Using Clerk's Shared Email Service (Default)

Clerk provides a shared email service that works out of the box, but has limitations:

**Limitations:**
- May be rate-limited across all Clerk users
- Emails might be marked as spam by some providers
- Not recommended for production

**How to check:**
- In Clerk Dashboard → **Emails** → **Email Provider**
- Should show "Clerk (shared)" as the provider
- Status should be **Active**

**If emails still don't arrive:**
- Check your spam/junk folder
- Try a different email address (Gmail, ProtonMail, Outlook)
- Some corporate email servers block shared email services

#### Using a Custom Email Provider (Recommended for Production)

For reliable email delivery, configure a custom provider:

**Supported Providers:**
- [Resend](https://resend.com) (Recommended - easy setup, generous free tier)
- SendGrid
- Mailgun
- Amazon SES
- Postmark

**How to configure:**

1. **Sign up for an email provider** (e.g., Resend)
   - Go to [https://resend.com](https://resend.com)
   - Create a free account
   - Generate an API key

2. **Configure in Clerk Dashboard**
   - Navigate to: **Customization** → **Emails** → **Email Provider**
   - Click **Configure custom provider**
   - Select your provider (e.g., **Resend**)
   - Enter your API key
   - Configure "From" email address
   - Test the configuration

3. **Verify domain** (for production)
   - Add DNS records to verify your domain
   - This ensures emails aren't marked as spam
   - Follow provider-specific instructions

---

### Step 3: Development Mode Workarounds

For local development, you can bypass email verification:

#### Option A: Use Development Instance

1. In Clerk Dashboard, ensure you're using a **Development** instance (not Production)
2. Navigate to: **Settings** → **Danger Zone** (or **Advanced**)
3. Look for **Development mode** or **Test mode** options
4. Enable options that allow easier testing

#### Option B: Use Magic Links (Alternative)

Instead of email codes, use magic links:

1. Navigate to: **User & Authentication** → **Verification**
2. Change verification method from **Email code** to **Email link**
3. Users click a link instead of entering a code
4. More reliable for development

#### Option C: Disable Email Verification (Development Only)

⚠️ **Warning:** Only for local development, never for production

1. Navigate to: **User & Authentication** → **Email, Phone, Username**
2. Change **Email address** from **Required with verification** to **Required**
3. This removes the verification step entirely
4. **Remember to re-enable before deploying to production**

---

### Step 4: Check Email Template

Clerk allows you to customize email templates, which might cause issues if misconfigured:

1. Navigate to: **Customization** → **Emails** → **Templates**
2. Find the **Verification code** template
3. Click **Edit** or **Preview**
4. Ensure the template includes the `{{code}}` variable
5. Reset to default if you suspect issues: Click **Reset to default**

---

### Step 5: Test Email Delivery

1. **Create a test user**
   - Go to Clerk Dashboard → **Users**
   - Click **Create user**
   - Enter a test email address you control
   - Check if verification email arrives

2. **Use Clerk's email logs**
   - Navigate to: **Customization** → **Emails** → **Logs**
   - View recent email sending attempts
   - Check for errors or failed deliveries

3. **Try different email providers**
   - Gmail: Usually works well
   - Outlook/Hotmail: May block shared providers
   - Custom domain: May have strict spam filters

---

## Quick Checklist

Use this checklist to ensure everything is configured correctly:

- [ ] Clerk Dashboard is accessible
- [ ] Email address authentication is enabled and required
- [ ] Email verification is enabled
- [ ] Email provider is configured (Clerk shared or custom)
- [ ] Email provider status is "Active"
- [ ] Email templates include `{{code}}` variable
- [ ] Tested with multiple email addresses
- [ ] Checked spam/junk folders
- [ ] Reviewed email logs in Clerk Dashboard

---

## Common Issues & Solutions

### Issue: "Email is sent but never arrives"

**Solutions:**
1. Check spam/junk folder
2. Check email provider logs in Clerk Dashboard
3. Try a different email address (Gmail usually works)
4. Wait 5-10 minutes (some providers have delays)
5. Configure a custom email provider for better deliverability

### Issue: "Invalid email provider configuration"

**Solutions:**
1. Verify API key is correct
2. Ensure API key has email sending permissions
3. Check "From" email address is verified with provider
4. Review provider-specific setup instructions

### Issue: "Rate limit exceeded"

**Solutions:**
1. Clerk's shared service has rate limits
2. Wait a few minutes and try again
3. Configure a custom email provider to avoid shared limits

### Issue: "Emails marked as spam"

**Solutions:**
1. Configure custom email provider with verified domain
2. Add SPF and DKIM records to your domain
3. Use a reputable email provider (Resend, SendGrid)
4. Ensure email content isn't triggering spam filters

---

## Production Deployment Checklist

Before deploying to production, ensure:

- [ ] **Custom email provider is configured** (don't use Clerk shared in production)
- [ ] **Domain is verified** with email provider
- [ ] **SPF and DKIM records** are added to DNS
- [ ] **"From" email address** uses your domain (e.g., noreply@stabletrack.com)
- [ ] **Email templates** are customized with your branding
- [ ] **Test emails** are successfully delivered
- [ ] **Email verification is enabled** (don't disable for production)
- [ ] **Rate limits** are appropriate for your expected user volume

---

## Recommended Email Provider: Resend

[Resend](https://resend.com) is recommended for StableTrack because:

- **Easy setup** - 5-minute configuration
- **Generous free tier** - 3,000 emails/month for free
- **Great deliverability** - High inbox placement rates
- **Developer-friendly** - Simple API, great docs
- **Built for transactional emails** - Perfect for verification codes

### Quick Resend Setup

1. **Sign up**
   - Go to [https://resend.com/signup](https://resend.com/signup)
   - Create account

2. **Get API key**
   - Dashboard → **API Keys**
   - Click **Create API Key**
   - Name it "StableTrack Production"
   - Copy the key (starts with `re_`)

3. **Configure in Clerk**
   - Clerk Dashboard → **Emails** → **Email Provider**
   - Select **Resend**
   - Paste API key
   - From email: `noreply@yourdomain.com` (or use onboarding@resend.dev for testing)
   - Save

4. **Verify domain** (optional but recommended)
   - Resend Dashboard → **Domains**
   - Add your domain
   - Add DNS records shown
   - Wait for verification

5. **Test**
   - Send a test email from Clerk
   - Check delivery in Resend logs

---

## Environment Variables

StableTrack doesn't require email-specific environment variables because Clerk handles email delivery. However, ensure these Clerk variables are set:

```bash
# Required Clerk variables (from .env file)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/dashboard"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/onboarding"
```

**No additional email variables needed** - everything is configured in Clerk Dashboard.

---

## Testing Email Verification

### Manual Test

1. Open incognito/private browser window
2. Navigate to `http://localhost:3000/sign-up` (or your deployed URL)
3. Enter a test email address you control
4. Enter name and password
5. Click **Continue** or **Sign up**
6. Check email inbox for verification code
7. Enter code in the verification screen
8. Should redirect to `/onboarding`

### Multiple Email Test

Test with various email providers to ensure broad compatibility:

- [ ] Gmail (user@gmail.com)
- [ ] Outlook (user@outlook.com)
- [ ] Yahoo (user@yahoo.com)
- [ ] Corporate email (user@company.com)
- [ ] Custom domain (user@yourdomain.com)

---

## Getting Help

If you've tried all solutions and emails still aren't sending:

1. **Check Clerk Status**
   - Visit [https://status.clerk.com](https://status.clerk.com)
   - Ensure no ongoing incidents

2. **Contact Clerk Support**
   - Clerk Dashboard → **Support** or **Help**
   - Include:
     - Application ID
     - Email provider being used
     - Error messages from logs
     - Steps already attempted

3. **Clerk Discord Community**
   - [https://clerk.com/discord](https://clerk.com/discord)
   - Active community can help troubleshoot

4. **Clerk Documentation**
   - [Email verification docs](https://clerk.com/docs/authentication/configuration/email-verification)
   - [Custom email provider setup](https://clerk.com/docs/authentication/configuration/email-providers)

---

## Summary

**The fix depends on your scenario:**

- **Just testing locally?** → Use Clerk's shared email service, check spam folder
- **Emails not arriving at all?** → Configure custom email provider (Resend recommended)
- **Deploying to production?** → Must configure custom email provider with verified domain
- **Need quick workaround?** → Disable verification for development only (re-enable for production)

**Most common solution:** Configure Resend as custom email provider in Clerk Dashboard - takes 5 minutes and solves most email delivery issues.

