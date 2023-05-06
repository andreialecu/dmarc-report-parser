import { simpleParser, ParsedMail } from "mailparser";
import JSZip from "jszip";
import { gunzip } from "zlib";
import { DmarcReportResults, parseDmarcReportsFromXml } from "./parseDmarcReportsFromXml";

/**
 * Parses a DMARC report from a raw email message
 * The DMARC report can be contained in a .zip, .gz or .xml attachment
 * @throws Error if the email does not contain a DMARC report
 * @param rawEmail The raw email message
 */
export async function parseDmarcReportFromEmail(rawEmail: string): Promise<DmarcReportResults> {
  // Parse the raw email to extract attachments
  const parsedEmail: ParsedMail = await simpleParser(rawEmail);

  // Filter the attachments to only include .zip and .gz files
  const attachments = parsedEmail.attachments.filter((attachment) => {
    if (attachment.filename) {
      const ext = attachment.filename.split(".").pop();
      return ext && ["zip", "gz", "xml"].includes(ext);
    }
    return false;
  });

  // Process the compressed attachments and extract their contents
  const extractedContents = (
    await Promise.all(
      attachments.map(async (attachment) => {
        if (attachment.filename?.endsWith(".zip")) {
          const zip = new JSZip();
          const contents = await zip.loadAsync(attachment.content);
          return Promise.all(
            Object.values(contents.files).map((file) => file.async("text"))
          );
        } else if (attachment.filename?.endsWith(".gz")) {
          return new Promise<string[]>((resolve, reject) => {
            gunzip(attachment.content as Buffer, (err, data) => {
              if (err) reject(err);
              else resolve([data.toString()]);
            });
          });
        } else if (
          attachment.filename?.endsWith(".xml")
        ) {
          return [attachment.content];
        }
        return [];
      })
    )
  ).flat();

  // Search for xml files within the extracted contents
  const xmlFiles = extractedContents
    .flat()
    .filter(
      (content) => typeof content === "string" && content.startsWith("<?xml")
    );

  if (xmlFiles.length === 0) {
    throw new Error("No DMARC reports found in email");
  }

  return await parseDmarcReportsFromXml(xmlFiles);
}


