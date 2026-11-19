# Onyx Branded Email Templates

Copy the HTML below into your **Firebase Console** under:
`Authentication` > `Templates` > `Password reset` (and others).

---

## 1. Password Reset Template (Onyx Edition)

**Subject:** `[ONYX] Security Protocol: Reset your credentials`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #020205; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #0a0a0f; border: 1px solid #1a1a23; border-radius: 24px; overflow: hidden; margin-top: 50px; }
        .header { padding: 40px; text-align: center; background: linear-gradient(to bottom, #8b5cf6, #0a0a0f); }
        .content { padding: 40px; text-align: center; }
        .footer { padding: 20px; text-align: center; font-size: 10px; color: rgba(255,255,255,0.2); letter-spacing: 2px; text-transform: uppercase; }
        .btn { display: inline-block; padding: 16px 32px; background-color: #8b5cf6; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; transition: all 0.3s; margin-top: 20px; box-shadow: 0 10px 30px rgba(139,92,246,0.3); }
        h1 { font-size: 32px; font-weight: 900; letter-spacing: -1px; margin-bottom: 20px; }
        p { color: rgba(255,255,255,0.6); line-height: 1.6; font-size: 14px; }
        .signature { margin-top: 40px; font-weight: bold; color: #8b5cf6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0; letter-spacing: 5px;">ONYX</h1>
        </div>
        <div class="content">
            <h1>RECOVER ACCESS</h1>
            <p>System monitoring has detected a request to reset your OnyX credentials. To proceed with the re-authentication protocol, click the link below:</p>
            <a href="%LINK%" class="btn">INITIALIZE RESET</a>
            <p style="margin-top: 30px; font-size: 11px;">If you did not request this, please disregard this transmission immediately.</p>
            <div class="signature">ANTHOLOGY CORE SYSTEM</div>
        </div>
        <div class="footer">
            PROTOCOL: ABSOLUTE_GRADE | REFRACTION SERIES
        </div>
    </div>
</body>
</html>
```

---

## 2. Setting up the Redirect URL

To ensure the link above takes the user back to **your** Onyx UI instead of the default Firebase page, you must configure the **Action URL** in Firebase:

1.  In Firebase Console, go to **Authentication** > **Settings**.
2.  Click on **Templates** tab.
3.  Click the **Edit icon** on the "Password reset" template.
4.  Click **customize action URL**.
5.  Set it to: `https://your-domain.com/reset-password` (or your local dev URL during testing).

> [!NOTE]
> During development, you can append `?oobCode=XYZ` to your local `/reset-password` route to test the UI!
