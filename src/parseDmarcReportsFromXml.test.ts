import { readFileSync } from "fs";
import { join } from "path";
import { parseDmarcReportsFromXml } from "./parseDmarcReportsFromXml";

describe("parseDmarcReportsFromXml", () => {
  const validXml = readFileSync(
    join(__dirname, "./test/fixtures/xml/report-valid.xml"),
    "utf-8"
  );
  const quarantineXml = readFileSync(
    join(__dirname, "./test/fixtures/xml/report-quarantine.xml"),
    "utf-8"
  );
  const rejectXml = readFileSync(
    join(__dirname, "./test/fixtures/xml/report-reject.xml"),
    "utf-8"
  );
  const dkimFailXml = readFileSync(
    join(__dirname, "./test/fixtures/xml/report-dkim-fail.xml"),
    "utf-8"
  );
  const spfFailXml = readFileSync(
    join(__dirname, "./test/fixtures/xml/report-spf-fail.xml"),
    "utf-8"
  );

  const invalidXml = readFileSync(
    join(__dirname, "./test/fixtures/xml/report-invalid.xml"),
    "utf-8"
  );

  it("should parse a single valid DMARC report", async () => {
    const result = await parseDmarcReportsFromXml([validXml]);
    expect(result.totalReports).toBe(1);
    expect(result.reports.length).toBe(1);
    expect(result).toMatchSnapshot();
  });

  it("should parse multiple valid DMARC reports", async () => {
    const result = await parseDmarcReportsFromXml([validXml, validXml]);
    expect(result.totalReports).toBe(2);
    expect(result.reports.length).toBe(2);
  });

  it("should parse a DMARC report with a quarantine disposition", async () => {
    const result = await parseDmarcReportsFromXml([quarantineXml]);
    expect(result.totalReports).toBe(1);
    expect(result.reports.length).toBe(1);
    expect(result.failures).toHaveLength(1);
    expect(result).toMatchSnapshot();
  });

  it("should parse a DMARC report with a reject disposition", async () => {
    const result = await parseDmarcReportsFromXml([rejectXml]);
    expect(result.totalReports).toBe(1);
    expect(result.reports.length).toBe(1);
    expect(result.failures).toHaveLength(1);
    expect(result).toMatchSnapshot();
  });

  it("should parse a DMARC report that is passing but has a DKIM failure", async () => {
    const result = await parseDmarcReportsFromXml([dkimFailXml]);
    expect(result.totalReports).toBe(1);
    expect(result.reports.length).toBe(1);
    expect(result.failures).toHaveLength(0);
    expect(result.dkimFailures).toHaveLength(1);
    expect(result).toMatchSnapshot();
  });

  it("should parse a DMARC report with a SPF failure", async () => {
    const result = await parseDmarcReportsFromXml([spfFailXml]);
    expect(result.totalReports).toBe(1);
    expect(result.reports.length).toBe(1);
    expect(result.failures).toHaveLength(0);
    expect(result.spfFailures).toHaveLength(1);
    expect(result).toMatchSnapshot();
  });

  it("should throw an error when parsing an invalid DMARC report", async () => {
    await expect(parseDmarcReportsFromXml([invalidXml])).rejects.toThrow();
  });

  it("should throw an error when parsing multiple reports of which some are invalid", async () => {
    await expect(
      parseDmarcReportsFromXml([validXml, invalidXml])
    ).rejects.toThrow();
  });
});
