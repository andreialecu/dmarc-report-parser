import { parseStringPromise } from "xml2js";
import { DmarcFeedbackSchema } from "./dmarc-feedback-schema";

/**
 * Parses DMARC reports from an array of XML strings or Buffers
 * @throws Error if the XML is not valid or does not match the DMARC schema
 */
export async function parseDmarcReportsFromXml(xmlFiles: (string | Buffer)[]) {
  const dmarcReports = (
    await Promise.all(xmlFiles.map((xml) => parseStringPromise(xml)))
  ).map((result) => DmarcFeedbackSchema.parse(result.feedback));

  // Analyze the DMARC reports and identify any failures
  const failures = dmarcReports.flatMap(({ record }) => {
    return record.filter((r) => {
      return r.row.policyEvaluated.disposition !== "none";
    });
  });

  const dkimFailures = dmarcReports.flatMap(({ record }) => {
    return record.filter((r) => {
      return r.row.policyEvaluated.dkim === "fail";
    });
  });

  const spfFailures = dmarcReports.flatMap(({ record }) => {
    return record.filter((r) => {
      return r.row.policyEvaluated.spf === "fail";
    });
  });

  return {
    totalReports: dmarcReports.length,
    totalFailures: failures.length,
    failures,
    dkimFailures,
    spfFailures,
    reports: dmarcReports,
  };
}
