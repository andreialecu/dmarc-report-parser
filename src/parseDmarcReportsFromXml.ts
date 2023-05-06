import { parseStringPromise } from "xml2js";
import { DmarcFeedback, DmarcFeedbackRecord, DmarcFeedbackSchema } from "./dmarc-feedback-schema";

/**
 * The results of parsing DMARC reports
 */
export type DmarcReportResults = {
  /**
   * The total number of reports parsed
   */
  totalReports: number;
  /**
   * The total number of reports that failed DMARC
   */
  totalFailures: number;
  /**
   * The reports that failed DMARC
   */
  failures: DmarcFeedbackRecord[];
  /**
   * The reports that failed DMARC due to DKIM
   */
  dkimFailures: DmarcFeedbackRecord[];
  /**
   * The reports that failed DMARC due to SPF
   */
  spfFailures: DmarcFeedbackRecord[];
  /**
   * The parsed DMARC reports
   */
  reports: DmarcFeedback[];
}

/**
 * Parses DMARC reports from an array of XML strings or Buffers
 * @throws Error if the XML is not valid or does not match the DMARC schema
 */
export async function parseDmarcReportsFromXml(xmlFiles: (string | Buffer)[]): Promise<DmarcReportResults> {
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
