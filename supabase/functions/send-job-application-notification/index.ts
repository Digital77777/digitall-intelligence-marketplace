import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobApplicationRequest {
  job_listing_id: string;
  applicant_name: string;
  applicant_email: string;
  job_title: string;
  employer_email: string;
  employer_name: string;
  cover_letter?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Job application notification function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      job_listing_id,
      applicant_name, 
      applicant_email, 
      job_title, 
      employer_email,
      employer_name,
      cover_letter 
    }: JobApplicationRequest = await req.json();

    console.log("Sending notification for job application:", {
      job_listing_id,
      applicant_name,
      job_title,
      employer_email
    });

    // Validate required fields
    if (!job_listing_id || !applicant_name || !applicant_email || !job_title || !employer_email) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send notification email to employer
    const employerEmailResponse = await resend.emails.send({
      from: "AI Education Platform <onboarding@resend.dev>",
      to: [employer_email],
      subject: `New Application for: ${job_title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 New Job Application!</h1>
            </div>
            <div class="content">
              <p>Hi ${employer_name || 'there'},</p>
              <p>Great news! You've received a new application for your job posting.</p>
              
              <div class="highlight">
                <h3 style="margin-top: 0;">📋 Application Details</h3>
                <p><strong>Position:</strong> ${job_title}</p>
                <p><strong>Applicant:</strong> ${applicant_name}</p>
                <p><strong>Email:</strong> ${applicant_email}</p>
              </div>
              
              ${cover_letter ? `
              <div class="highlight">
                <h3 style="margin-top: 0;">💬 Cover Letter</h3>
                <p>${cover_letter.replace(/\n/g, '<br>')}</p>
              </div>
              ` : ''}
              
              <p>Log in to your dashboard to review this application and respond to the candidate.</p>
              
              <p style="margin-top: 30px;">Best regards,<br>The AI Education Platform Team</p>
            </div>
            <div class="footer">
              <p>You received this email because someone applied to your job posting on AI Education Platform.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Employer email sent:", employerEmailResponse);

    // Send confirmation email to applicant
    const applicantEmailResponse = await resend.emails.send({
      from: "AI Education Platform <onboarding@resend.dev>",
      to: [applicant_email],
      subject: `Application Submitted: ${job_title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">✅ Application Submitted!</h1>
            </div>
            <div class="content">
              <p>Hi ${applicant_name},</p>
              <p>Your application has been successfully submitted!</p>
              
              <div class="highlight">
                <h3 style="margin-top: 0;">📋 Application Summary</h3>
                <p><strong>Position:</strong> ${job_title}</p>
                <p><strong>Status:</strong> Under Review</p>
              </div>
              
              <p>The employer will review your application and get back to you if they're interested. In the meantime, you can track your applications in your dashboard.</p>
              
              <p>Good luck! 🍀</p>
              
              <p style="margin-top: 30px;">Best regards,<br>The AI Education Platform Team</p>
            </div>
            <div class="footer">
              <p>You received this email because you applied to a job on AI Education Platform.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Applicant email sent:", applicantEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        employerEmail: employerEmailResponse, 
        applicantEmail: applicantEmailResponse 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-job-application-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
