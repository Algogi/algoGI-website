import { EmailBlock } from "@/lib/types/email";
import { generateUnsubscribeToken } from "@/lib/email/unsubscribe-token";
import {
  inlineStyles,
  wrapInTable,
  getFallbackFont,
  generateColumnLayout,
  sanitizeEmailHTML,
} from "./email-css-utils";
import { replacePersonalizationTags, replacePersonalizationTagsInHTML, SAMPLE_CONTACT, ContactData } from "./personalization";
import { getBaseUrl, resolveMediaUrl } from "./base-url";

/**
 * Render email blocks to HTML
 */
export function renderEmailBlocksToHTML(
  blocks: EmailBlock[],
  baseUrl?: string,
  contact?: ContactData,
  preserveTags: boolean = false
): string {
  // For server-side rendering, we'll create a simple HTML structure
  // In a real implementation, you'd use React's renderToString or a template engine
  // Use sample contact for preview if no contact provided
  const contactData = contact || SAMPLE_CONTACT;
  
  let html = '<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">';
  
  blocks.forEach((block) => {
    html += renderBlockToHTML(block, baseUrl, contactData, preserveTags);
  });
  
  html += '</div>';
  
  return wrapEmailTemplate(html);
}

/**
 * Render a single block to HTML
 */
function renderBlockToHTML(
  block: EmailBlock,
  baseUrl?: string,
  contact?: ContactData,
  preserveTags: boolean = false
): string {
  const contactData = contact || SAMPLE_CONTACT;
  const mediaBaseUrl = baseUrl || getBaseUrl();
  const personalizeText = (value: string) =>
    preserveTags ? value || "" : replacePersonalizationTags(value || "", contactData);
  const personalizeHtml = (value: string) =>
    preserveTags ? value || "" : replacePersonalizationTagsInHTML(value || "", contactData);
  switch (block.type) {
    case "text":
      const textContent = block.props.text || "";
      const personalizedText = personalizeText(textContent);
      const textHTML = String(personalizedText).replace(/\n/g, "<br>");
      return `<div style="padding: ${block.props.padding || "10px"}; text-align: ${block.props.align || "left"}; color: ${block.props.color || "#333"}; font-size: ${block.props.fontSize || "16px"}; line-height: ${block.props.lineHeight || "1.6"};">
        ${textHTML}
      </div>`;
    
    case "image":
      const imgSrc = resolveMediaUrl(block.props.src, mediaBaseUrl) || "https://via.placeholder.com/600x300";
      const imgTag = `<img src="${imgSrc}" alt="${block.props.alt || ""}" style="max-width: 100%; height: auto; display: block; margin: ${block.props.align === "center" ? "0 auto" : "0"};" />`;
      if (block.props.link) {
        return `<div style="padding: ${block.props.padding || "10px"}; text-align: ${block.props.align || "center"};">
          <a href="${wrapTrackingLink(block.props.link, block.id, baseUrl)}">${imgTag}</a>
        </div>`;
      }
      return `<div style="padding: ${block.props.padding || "10px"}; text-align: ${block.props.align || "center"};">
        ${imgTag}
      </div>`;
    
    case "button":
      const buttonText = personalizeText(block.props.text || "Button");
      return `<div style="padding: ${block.props.padding || "10px"}; text-align: ${block.props.align || "center"};">
        <a href="${wrapTrackingLink(block.props.link || "#", block.id, baseUrl)}" 
           style="display: inline-block; padding: ${block.props.padding || "12px 24px"}; 
           background-color: ${block.props.backgroundColor || "#4a3aff"}; 
           color: ${block.props.textColor || "#ffffff"}; 
           text-decoration: none; 
           border-radius: ${block.props.borderRadius || "5px"}; 
           font-weight: bold; 
           font-size: ${block.props.fontSize || "16px"};">
          ${buttonText}
        </a>
      </div>`;
    
    case "divider": {
      const style = block.props.style || "solid";
      const color = block.props.color || "#eeeeee";
      const thickness = block.props.thickness || "1px";
      const padding = block.props.padding || "20px";
      
      if (style === "festive-dots") {
        return `<div style="padding: ${padding}; text-align: center;">
          <span style="color: ${color}; font-size: 20px; letter-spacing: 10px;">•••</span>
        </div>`;
      }
      if (style === "festive-snowflakes") {
        return `<div style="padding: ${padding}; text-align: center;">
          <span style="color: ${color}; font-size: 20px; letter-spacing: 15px;">❄ ❄ ❄</span>
        </div>`;
      }
      if (style === "festive-stars") {
        return `<div style="padding: ${padding}; text-align: center;">
          <span style="color: ${color}; font-size: 20px; letter-spacing: 15px;">✦ ✦ ✦</span>
        </div>`;
      }
      return `<div style="padding: ${padding};">
        <hr style="border: none; border-top: ${thickness} ${style} ${color}; margin: 0;" />
      </div>`;
    }
    
    case "spacer":
      return `<div style="height: ${block.props.height || "20px"};"></div>`;
    
    case "link":
      const linkText = personalizeText(block.props.text || "Link");
      return `<div style="padding: ${block.props.padding || "10px"}; text-align: ${block.props.align || "left"};">
        <a href="${block.props.url || "#"}" 
           style="color: ${block.props.color || "#4a3aff"}; 
           font-size: ${block.props.fontSize || "16px"}; 
           text-decoration: ${block.props.underline !== false ? "underline" : "none"};">
          ${linkText}
        </a>
      </div>`;
    
    case "html":
      // Parse and render HTML content
      const htmlContent = block.props.html || "";
      // Return the HTML as-is (it's already HTML)
      return sanitizeEmailHTML(htmlContent);
    
    case "hero-banner": {
      const imageUrl = resolveMediaUrl(block.props.imageUrl, mediaBaseUrl);
      const heading = personalizeText(block.props.heading || "");
      const subheading = personalizeText(block.props.subheading || "");
      const ctaText = personalizeText(block.props.ctaText || "");
      const ctaLink = wrapTrackingLink(block.props.ctaLink || "#", block.id, baseUrl);
      const overlayOpacity = Math.max(0, Math.min(1, block.props.overlayOpacity || 0.4));
      const textColor = block.props.textColor || "#ffffff";
      const headingSize = block.props.headingSize || "32px";
      const subheadingSize = block.props.subheadingSize || "18px";
      const align = block.props.align || "center";
      const height = block.props.height || "400px";
      const fallbackBgColor = "#000000";
      const overlayBackground = `rgba(0, 0, 0, ${overlayOpacity})`;
      const alignment = align === "right" ? "right" : align === "left" ? "left" : "center";
      const contentMargin = alignment === "center" ? "0 auto" : alignment === "right" ? "0 0 0 auto" : "0";
      const backgroundStyles = imageUrl
        ? `background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
        : `background-color: ${fallbackBgColor};`;
      const vmlBackground = imageUrl
        ? `<!--[if gte mso 9]>
            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:${height};">
              <v:fill type="frame" src="${imageUrl}" color="${fallbackBgColor}" />
              <v:textbox inset="0,0,0,0">
            <![endif]-->`
        : "";
      const vmlBackgroundEnd = imageUrl
        ? `<!--[if gte mso 9]>
              </v:textbox>
            </v:rect>
            <![endif]-->`
        : "";
      console.log(backgroundStyles, "bgstyler");
      return wrapInTable(`
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0; border-collapse: collapse; height: ${height}; ${backgroundStyles}">
          <tr>
            <td style="padding: 0; height: ${height}; ${backgroundStyles}">
              ${vmlBackground}
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" height="${height}" style="border-collapse: collapse; background-color: ${overlayBackground};">
                <tr>
                  <td align="${alignment}" valign="middle" style="padding: 40px 20px;">
                    <div style="max-width: 600px; margin: ${contentMargin}; color: ${textColor}; text-align: ${alignment}; font-family: ${getFallbackFont()};">
                      <h1 style="font-size: ${headingSize}; font-weight: bold; margin: 0 0 ${subheading ? "10px" : "20px"} 0; color: ${textColor}; font-family: ${getFallbackFont()};">
                        ${heading}
                      </h1>
                      ${subheading ? `<p style="font-size: ${subheadingSize}; margin: 0 0 20px 0; color: ${textColor}; opacity: 0.9; font-family: ${getFallbackFont()};">${subheading}</p>` : ""}
                      <a href="${ctaLink}" style="display: inline-block; padding: 12px 24px; background-color: #4a3aff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; font-family: ${getFallbackFont()};">
                        ${ctaText}
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
              ${vmlBackgroundEnd}
            </td>
          </tr>
        </table>
      `);
    }
    
    case "gradient-header": {
      const text = personalizeText(block.props.text || "");
      const gradientColors = Array.isArray(block.props.gradientColors) && block.props.gradientColors.length > 0
        ? block.props.gradientColors
        : ["#4a3aff", "#7c3aed"];
      const gradientString = `linear-gradient(135deg, ${gradientColors.join(", ")})`;
      const fallbackColor = gradientColors[0] || "#4a3aff";
      const fontSize = block.props.fontSize || "32px";
      const fontWeight = block.props.fontWeight || "bold";
      const align = block.props.align || "center";
      const padding = block.props.padding || "40px 20px";
      
      return wrapInTable(`
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0; background: ${gradientString}; background-color: ${fallbackColor};">
          <tr>
            <td style="padding: ${padding}; text-align: ${align}; font-family: ${getFallbackFont()};">
              <h2 style="font-size: ${fontSize}; font-weight: ${fontWeight}; color: #ffffff; margin: 0; font-family: ${getFallbackFont()};">
                ${text}
              </h2>
            </td>
          </tr>
        </table>
      `);
    }
    
    case "rich-text": {
      const content = personalizeHtml(block.props.content || "");
      const columns = block.props.columns || 1;
      const fontSize = block.props.fontSize || "16px";
      const fontFamily = getFallbackFont(block.props.fontFamily);
      const color = block.props.color || "#333333";
      const lineHeight = block.props.lineHeight || "1.6";
      
      if (columns === 1) {
        return `<div style="font-size: ${fontSize}; font-family: ${fontFamily}; color: ${color}; line-height: ${lineHeight}; padding: 20px;">
          ${sanitizeEmailHTML(content)}
        </div>`;
      }
      
      // Multi-column layout using tables
      const columnContent = sanitizeEmailHTML(content);
      const columnWidth = Math.floor(600 / columns) - 10;
      let cells = "";
      for (let i = 0; i < columns; i++) {
        cells += `
          <td width="${columnWidth}" style="padding: 0 10px; vertical-align: top; font-size: ${fontSize}; font-family: ${fontFamily}; color: ${color}; line-height: ${lineHeight};">
            ${columnContent}
          </td>
        `;
      }
      
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 20px;">
          <tr>
            ${cells}
          </tr>
        </table>
      `;
    }
    
    case "quote": {
      const quote = personalizeText(block.props.quote || "");
      const author = personalizeText(block.props.author || "");
      const authorTitle = block.props.authorTitle || "";
      const avatarUrl = resolveMediaUrl(block.props.avatarUrl, mediaBaseUrl);
      const backgroundColor = block.props.backgroundColor || "#f5f5f5";
      const textColor = block.props.textColor || "#333333";
      const borderColor = block.props.borderColor || "#4a3aff";
      const align = block.props.align || "left";
      
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; background-color: ${backgroundColor};">
          <tr>
            <td style="padding: 30px; border-left: 4px solid ${borderColor};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  ${avatarUrl ? `<td width="50" style="padding-right: 15px; vertical-align: top;">
                    <img src="${avatarUrl}" alt="${author}" width="50" height="50" style="border-radius: 50%; object-fit: cover;" />
                  </td>` : ""}
                  <td style="vertical-align: top;">
                    <p style="font-size: 18px; font-style: italic; color: ${textColor}; margin: 0 0 15px 0; line-height: 1.6; font-family: ${getFallbackFont()};">
                      "${quote}"
                    </p>
                    <div style="text-align: ${align};">
                      <div style="font-size: 16px; font-weight: bold; color: ${textColor}; margin-bottom: ${authorTitle ? "5px" : "0"}; font-family: ${getFallbackFont()};">
                        ${author}
                      </div>
                      ${authorTitle ? `<div style="font-size: 14px; color: ${textColor}; opacity: 0.7; font-family: ${getFallbackFont()};">${authorTitle}</div>` : ""}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    }
    
    case "feature-list": {
      const items = Array.isArray(block.props.items) ? block.props.items : [];
      const iconSize = block.props.iconSize || "20px";
      const iconColor = block.props.iconColor || "#4a3aff";
      const textColor = block.props.textColor || "#333333";
      const fontSize = block.props.fontSize || "16px";
      const spacing = block.props.spacing || "15px";
      
      const itemsHTML = items.map((item: any) => {
        const personalizedText = personalizeText(item.text || "");
        return `
        <tr>
          <td width="30" style="padding-right: 10px; vertical-align: top; padding-bottom: ${spacing};">
            ${item.icon ? `<img src="${resolveMediaUrl(item.icon, mediaBaseUrl)}" alt="" width="${iconSize}" height="${iconSize}" />` : `<span style="color: ${iconColor}; font-size: ${iconSize};">✓</span>`}
          </td>
          <td style="vertical-align: top; padding-bottom: ${spacing}; color: ${textColor}; font-size: ${fontSize}; font-family: ${getFallbackFont()};">
            ${personalizedText}
          </td>
        </tr>
      `;
      }).join("");
      
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 20px;">
          ${itemsHTML}
        </table>
      `;
    }
    
    case "stats-row": {
      const stats = Array.isArray(block.props.stats) ? block.props.stats : [];
      const valueColor = block.props.valueColor || "#4a3aff";
      const labelColor = block.props.labelColor || "#666666";
      const valueSize = block.props.valueSize || "32px";
      const labelSize = block.props.labelSize || "14px";
      const backgroundColor = block.props.backgroundColor || "#f5f5f5";
      const columns = block.props.columns || 3;
      
      const columnWidth = Math.floor(100 / columns);
      const statsHTML = stats.map((stat: any) => `
        <td width="${columnWidth}%" style="text-align: center; padding: 20px;">
          ${stat.icon ? `<img src="${resolveMediaUrl(stat.icon, mediaBaseUrl)}" alt="" width="30" height="30" style="margin-bottom: 10px;" />` : ""}
          <div style="font-size: ${valueSize}; font-weight: bold; color: ${valueColor}; margin-bottom: 5px; font-family: ${getFallbackFont()};">
            ${stat.value || ""}
          </div>
          <div style="font-size: ${labelSize}; color: ${labelColor}; font-family: ${getFallbackFont()};">
            ${stat.label || ""}
          </div>
        </td>
      `).join("");
      
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; background-color: ${backgroundColor}; padding: 40px 20px;">
          <tr>
            ${statsHTML}
          </tr>
        </table>
      `;
    }
    
    case "image-gallery": {
      const images = Array.isArray(block.props.images) ? block.props.images : [];
      const columns = block.props.columns || 2;
      const spacing = block.props.spacing || "10px";
      const showCaptions = block.props.showCaptions || false;
      
      const columnWidth = Math.floor(100 / columns);
      const imagesHTML = images.map((image: any, index: number) => {
        const imgTag = `<img src="${resolveMediaUrl(image.src, mediaBaseUrl)}" alt="${image.alt || ""}" style="max-width: 100%; height: auto; display: block;" />`;
        const wrappedImg = image.link ? `<a href="${wrapTrackingLink(image.link, `${block.id}-img-${index}`, baseUrl)}">${imgTag}</a>` : imgTag;
        const caption = showCaptions && image.caption ? `<p style="font-size: 12px; color: #666; margin-top: 5px; text-align: center; font-family: ${getFallbackFont()};">${image.caption}</p>` : "";
        
        return `
          <td width="${columnWidth}%" style="padding: ${spacing}; vertical-align: top;">
            ${wrappedImg}
            ${caption}
          </td>
        `;
      }).join("");
      
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 20px;">
          <tr>
            ${imagesHTML}
          </tr>
        </table>
      `;
    }
    
    case "primary-button": {
      const text = personalizeText(block.props.text || "Button");
      const link = wrapTrackingLink(block.props.link || "#", block.id, baseUrl);
      const backgroundColor = block.props.backgroundColor || "#4a3aff";
      const textColor = block.props.textColor || "#ffffff";
      const fontSize = block.props.fontSize || "16px";
      const padding = block.props.padding || "12px 24px";
      const borderRadius = block.props.borderRadius || "5px";
      const glow = block.props.glow || false;
      const fullWidth = block.props.fullWidth || false;
      const align = block.props.align || "center";
      const boxShadow = glow ? `0 4px 15px ${backgroundColor}40` : "none";
      
      return `
        <div style="padding: 10px; text-align: ${align};">
          <a href="${link}" 
             style="display: ${fullWidth ? "block" : "inline-block"}; width: ${fullWidth ? "100%" : "auto"}; padding: ${padding}; 
             background-color: ${backgroundColor}; color: ${textColor}; text-decoration: none; 
             border-radius: ${borderRadius}; font-weight: bold; font-size: ${fontSize}; 
             box-shadow: ${boxShadow}; font-family: ${getFallbackFont()};">
            ${text}
          </a>
        </div>
      `;
    }
    
    case "secondary-button": {
      const text = personalizeText(block.props.text || "Button");
      const link = wrapTrackingLink(block.props.link || "#", block.id, baseUrl);
      const borderColor = block.props.borderColor || "#4a3aff";
      const textColor = block.props.textColor || "#4a3aff";
      const fontSize = block.props.fontSize || "16px";
      const padding = block.props.padding || "12px 24px";
      const borderRadius = block.props.borderRadius || "5px";
      const align = block.props.align || "center";
      
      return `
        <div style="padding: 10px; text-align: ${align};">
          <a href="${link}" 
             style="display: inline-block; padding: ${padding}; background-color: transparent; 
             color: ${textColor}; text-decoration: none; border: 2px solid ${borderColor}; 
             border-radius: ${borderRadius}; font-weight: bold; font-size: ${fontSize}; 
             font-family: ${getFallbackFont()};">
            ${text}
          </a>
        </div>
      `;
    }
    
    case "button-group": {
      const buttons = Array.isArray(block.props.buttons) ? block.props.buttons : [];
      const spacing = block.props.spacing || "10px";
      const align = block.props.align || "center";
      
      const buttonsHTML = buttons.map((button: any, index: number) => {
        const link = wrapTrackingLink(button.link || "#", `${block.id}-btn-${index}`, baseUrl);
        const buttonText = personalizeText(button.text || "Button");
        const isPrimary = button.variant === "primary" || !button.variant;
        const buttonStyle = isPrimary
          ? `display: inline-block; padding: 12px 24px; background-color: #4a3aff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; font-family: ${getFallbackFont()};`
          : `display: inline-block; padding: 12px 24px; background-color: transparent; color: #4a3aff; text-decoration: none; border: 2px solid #4a3aff; border-radius: 5px; font-weight: bold; font-size: 16px; font-family: ${getFallbackFont()};`;
        
        return `<a href="${link}" style="${buttonStyle}">${buttonText}</a>`;
      }).join(`<span style="margin: 0 ${spacing};">&nbsp;</span>`);
      
      return `
        <div style="padding: 10px; text-align: ${align};">
          ${buttonsHTML}
        </div>
      `;
    }
    
    case "social-links": {
      const links = Array.isArray(block.props.links) ? block.props.links : [];
      const iconSize = block.props.iconSize || "24px";
      const iconColor = block.props.iconColor || "#4a3aff";
      const spacing = block.props.spacing || "15px";
      const align = block.props.align || "center";
      const layout = block.props.layout || "horizontal";
      
      const linksHTML = links.map((link: any) => {
        const iconContent = link.iconUrl
          ? `<img src="${resolveMediaUrl(link.iconUrl, mediaBaseUrl)}" alt="${link.label || link.platform}" width="${iconSize}" height="${iconSize}" />`
          : `<span style="color: ${iconColor}; font-size: ${iconSize};">${link.platform}</span>`;
        
        return `<a href="${link.url || "#"}" target="_blank" rel="noopener noreferrer" style="margin: 0 ${spacing}; text-decoration: none;">${iconContent}</a>`;
      }).join("");
      
      return `
        <div style="padding: 20px; text-align: ${align};">
          ${linksHTML}
        </div>
      `;
    }
    
    case "footer": {
      const companyName = block.props.companyName || "";
      const address = block.props.address || "";
      const phone = block.props.phone || "";
      const email = block.props.email || "";
      const unsubscribeText = block.props.unsubscribeText || "Unsubscribe";
      const unsubscribeUrl = block.props.unsubscribeUrl || "#";
      const copyrightText = block.props.copyrightText || "";
      const backgroundColor = block.props.backgroundColor || "#f5f5f5";
      const textColor = block.props.textColor || "#666666";
      const fontSize = block.props.fontSize || "12px";
      
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; background-color: ${backgroundColor}; padding: 30px 20px;">
          <tr>
            <td style="text-align: center; font-size: ${fontSize}; color: ${textColor}; font-family: ${getFallbackFont()};">
              ${companyName ? `<div style="font-weight: bold; margin-bottom: 10px;">${companyName}</div>` : ""}
              ${address ? `<div style="margin-bottom: 5px;">${address}</div>` : ""}
              ${phone ? `<div style="margin-bottom: 5px;">${phone}</div>` : ""}
              ${email ? `<div style="margin-bottom: 10px;"><a href="mailto:${email}" style="color: ${textColor}; text-decoration: underline;">${email}</a></div>` : ""}
              ${unsubscribeText ? `<div style="margin-top: 15px; margin-bottom: 10px;"><a href="${unsubscribeUrl}" style="color: ${textColor}; text-decoration: underline;">${unsubscribeText}</a></div>` : ""}
              ${copyrightText ? `<div style="margin-top: 10px; font-size: 11px; opacity: 0.8;">${copyrightText}</div>` : ""}
            </td>
          </tr>
        </table>
      `;
    }
    
    case "columns": {
      // Columns block is complex - for now, render a simple placeholder
      // Full implementation would require nested block rendering
      const columns = block.props.columns || 2;
      const columnGap = block.props.columnGap || "20px";
      const backgroundColor = block.props.backgroundColor || "";
      const padding = block.props.padding || "20px";
      
      const columnWidth = Math.floor(100 / columns);
      let cells = "";
      for (let i = 0; i < columns; i++) {
        cells += `
          <td width="${columnWidth}%" style="padding: ${columnGap}; vertical-align: top;">
            <div style="min-height: 50px; padding: 20px; background-color: #f0f0f0; text-align: center; color: #999;">
              Column ${i + 1}
            </div>
          </td>
        `;
      }
      
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: ${padding}; ${backgroundColor ? `background-color: ${backgroundColor};` : ""}">
          <tr>
            ${cells}
          </tr>
        </table>
      `;
    }
    
    default:
      return "";
  }
}

/**
 * Wrap email content in full HTML template
 */
function wrapEmailTemplate(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  ${content}
</body>
</html>`;
}

/**
 * Wrap link with tracking URL
 */
export function wrapTrackingLink(originalUrl: string, blockId: string, baseUrl?: string): string {
  if (!baseUrl) {
    return originalUrl;
  }
  
  const trackingUrl = `${baseUrl}/admin/emails/api/track/click?url=${encodeURIComponent(originalUrl)}&blockId=${blockId}`;
  return trackingUrl;
}

/**
 * Add tracking pixel to email HTML
 */
export function addTrackingPixel(html: string, campaignId: string, recipientId: string, baseUrl?: string): string {
  if (!baseUrl) {
    return html;
  }
  
  const pixelUrl = `${baseUrl}/admin/emails/api/track/open/${campaignId}/${recipientId}`;
  const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display: none;" />`;
  
  // Insert before closing body tag
  return html.replace("</body>", `${pixel}</body>`);
}

/**
 * Convert HTML to plain text (simple version)
 */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Generate unsubscribe URL with secure token
 */
export function generateUnsubscribeUrl(
  email: string,
  baseUrl: string,
  campaignId?: string
): string {
  const token = generateUnsubscribeToken(email, campaignId);
  return `${baseUrl}/email-preferences?token=${encodeURIComponent(token)}`;
}

/**
 * Generate email footer HTML with unsubscribe link
 */
export function generateCampaignEmailFooter(
  baseUrl: string,
  unsubscribeUrl: string
): string {
  return `
    <div style="margin-top: 40px; padding: 20px; border-top: 1px solid #eeeeee; text-align: center; font-size: 12px; color: #666666; font-family: Arial, sans-serif;">
      <p style="margin: 0 0 10px 0;">
        You're receiving this email because you're subscribed to our mailing list.
      </p>
      <p style="margin: 0;">
        <a href="${unsubscribeUrl}" style="color: #4a3aff; text-decoration: underline;">
          Manage your email preferences
        </a>
        &nbsp;|&nbsp;
        <a href="${unsubscribeUrl}" style="color: #4a3aff; text-decoration: underline;">
          Unsubscribe
        </a>
      </p>
    </div>
  `;
}

/**
 * Add campaign footer (unsubscribe link + tracking pixel) to email HTML
 */
export function addCampaignFooter(
  html: string,
  email: string,
  campaignId: string,
  recipientId: string,
  baseUrl: string
): string {
  if (!baseUrl) {
    return html;
  }

  // Generate unsubscribe URL
  const unsubscribeUrl = generateUnsubscribeUrl(email, baseUrl, campaignId);
  
  // Generate footer
  const footer = generateCampaignEmailFooter(baseUrl, unsubscribeUrl);
  
  // Add tracking pixel (recipientId is already sanitized, but encode for URL safety)
  const pixelUrl = `${baseUrl}/admin/emails/api/track/open/${encodeURIComponent(campaignId)}/${encodeURIComponent(recipientId)}`;
  const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display: none;" />`;
  
  // Insert footer and pixel before closing body tag
  return html.replace("</body>", `${footer}${pixel}</body>`);
}

/**
 * Wrap all links in email HTML for click tracking
 */
export function wrapAllLinksForTracking(
  html: string,
  campaignId: string,
  recipientId: string,
  baseUrl: string
): string {
  if (!baseUrl) {
    return html;
  }

  // Match all <a href="..."> tags, excluding unsubscribe links
  const linkRegex = /<a\s+([^>]*\s+)?href=["']([^"']+)["']([^>]*)>/gi;
  
  return html.replace(linkRegex, (match, before, url, after) => {
    // Skip if it's already a tracking URL or unsubscribe link
    if (url.includes('/email-preferences') || url.includes('/admin/emails/api/track/')) {
      return match;
    }
    
    // Skip mailto: and other non-http links
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return match;
    }
    
    // Create tracking URL
    const trackingUrl = `${baseUrl}/admin/emails/api/track/click?url=${encodeURIComponent(url)}&campaignId=${encodeURIComponent(campaignId)}&recipientId=${encodeURIComponent(recipientId)}`;
    
    // Reconstruct the link with tracking URL
    return `<a ${before || ''}href="${trackingUrl}"${after}>`;
  });
}

