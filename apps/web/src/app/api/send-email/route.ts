import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { to, subject, title, message, code } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn("RESEND_API_KEY is not defined in environment variables. Simulating email send.");
      return NextResponse.json({ 
        success: true, 
        message: "Email simulated successfully (API Key missing in environment)", 
        simulated: true,
        code: code
      });
    }

    const htmlContent = `
      <div style="background-color: #05020a; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
        <div style="max-width: 550px; margin: 0 auto; background-color: #0d061c; border: 1px solid #4a21a5; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(160, 102, 255, 0.15);">
          <!-- Top glowing border -->
          <div style="height: 3px; background: linear-gradient(90deg, #4a21a5 0%, #a066ff 50%, #4a21a5 100%);"></div>
          
          <!-- Logo Header -->
          <div style="background-color: #1b0c40; padding: 24px; border-bottom: 1px solid #4a21a5; text-align: center;">
            <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
              Code<span style="color: #a066ff;">Pulse</span>
            </span>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px; background-color: #0d061c;">
            <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; text-align: center;">
              ${title}
            </h2>
            <p style="font-size: 15px; color: #ccc; line-height: 1.6; margin-bottom: 24px; text-align: center;">
              ${message}
            </p>
            
            <!-- Glow Code Box -->
            <div style="background-color: #120926; border: 2px dashed #a066ff; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0; box-shadow: 0 0 15px rgba(160, 102, 255, 0.15);">
              <span style="display: block; font-size: 11px; font-weight: 700; color: #a066ff; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;">
                Código de Verificación
              </span>
              <span style="font-size: 38px; font-weight: 800; color: #ffffff; letter-spacing: 0.25em; font-family: 'Courier New', Courier, monospace;">
                ${code}
              </span>
            </div>
            
            <p style="font-size: 13px; color: #8b7ca0; text-align: center; line-height: 1.5; margin-bottom: 0;">
              Este código es válido por 10 minutos. Si no solicitaste este código, puedes ignorar este correo de forma segura.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="padding: 24px; background-color: #07030e; border-top: 1px solid #1e113b; text-align: center; font-size: 12px; color: #6a748b; line-height: 1.5;">
            Este es un correo automático enviado por <strong>CodePulse Platform</strong>.<br>
            Creado por <strong>Omega Dev</strong> &amp; <strong>Dancar Dev</strong>.
          </div>
        </div>
      </div>
    `;

    // Make the API request to Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'CodePulse <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      return NextResponse.json({ success: false, error: data.message || "Failed to send email" }, { status: response.status });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
