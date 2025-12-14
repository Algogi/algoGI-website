import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getWordPressClient } from "@/lib/wordpress/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = getWordPressClient();
    const baseUrl = process.env.WORDPRESS_API_URL || "";
    
    // Test basic connection
    const testUrl = `${baseUrl}/posts?per_page=1`;
    const hasAuth = !!(process.env.WORDPRESS_USERNAME && (process.env.WORDPRESS_PASSWORD || process.env.WORDPRESS_APPLICATION_PASSWORD));
    
    let testResult: any = {
      configured: !!baseUrl,
      hasAuth,
      baseUrl: baseUrl || "Not set",
      authMethod: process.env.WORDPRESS_APPLICATION_PASSWORD ? "Application Password" : process.env.WORDPRESS_PASSWORD ? "Basic Auth" : "None",
    };

    if (!baseUrl) {
      return NextResponse.json({
        ...testResult,
        error: "WORDPRESS_API_URL is not set in environment variables",
      });
    }

    try {
      // Try to fetch a single post
      const response = await fetch(testUrl, {
        headers: {
          "Content-Type": "application/json",
          ...(hasAuth && {
            Authorization: `Basic ${Buffer.from(
              `${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APPLICATION_PASSWORD || process.env.WORDPRESS_PASSWORD || ""}`
            ).toString("base64")}`,
          }),
        },
      });

      testResult.status = response.status;
      testResult.statusText = response.statusText;
      testResult.ok = response.ok;

      if (response.ok) {
        const data = await response.json();
        testResult.success = true;
        testResult.postsFound = Array.isArray(data) ? data.length : 0;
        testResult.message = "WordPress API connection successful!";
      } else {
        const errorText = await response.text();
        testResult.success = false;
        testResult.error = `WordPress API returned ${response.status}: ${response.statusText}`;
        
        if (response.status === 403) {
          testResult.suggestions = [
            "Check if WordPress REST API is enabled",
            "Verify authentication credentials are correct",
            "If using Application Password, ensure it's set in WORDPRESS_APPLICATION_PASSWORD",
            "Check WordPress user permissions (user needs at least 'Editor' role)",
            "Verify the API URL is correct (should be: https://yoursite.com/wp-json/wp/v2)",
          ];
        } else if (response.status === 404) {
          testResult.suggestions = [
            "Verify WORDPRESS_API_URL is correct",
            "Ensure WordPress REST API is enabled (usually enabled by default)",
            "Check if the URL should end with /wp-json/wp/v2",
          ];
        } else if (response.status === 401) {
          testResult.suggestions = [
            "Check your WordPress username",
            "Verify your password or application password is correct",
            "If using Application Password, generate a new one from WordPress Admin > Users > Your Profile > Application Passwords",
          ];
        }
        
        try {
          const errorJson = JSON.parse(errorText);
          testResult.errorDetails = errorJson;
        } catch {
          testResult.errorResponse = errorText.substring(0, 500);
        }
      }
    } catch (error: any) {
      testResult.success = false;
      testResult.error = error.message || "Failed to connect to WordPress API";
      testResult.suggestions = [
        "Check if WORDPRESS_API_URL is accessible from your server",
        "Verify the URL is correct and includes the protocol (http:// or https://)",
        "Check for network/firewall issues",
      ];
    }

    return NextResponse.json(testResult);
  } catch (error: any) {
    console.error("Error testing WordPress connection:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to test WordPress connection",
      },
      { status: 500 }
    );
  }
}

