import { readFileSync } from 'fs';
import { join } from 'path';
import { parseDmarcReportFromEmail } from './parseDmarcReportFromEmail';
import { it, describe, expect } from 'vitest';

describe('parseDMARCReport', () => {

  it('should parse a DMARC report from a raw email with a gzip attachment', async () => {
    const testRawEmail = readFileSync(join(__dirname, "./test/fixtures/email/email-source-with-gz.txt"), "utf-8");

    const result = await parseDmarcReportFromEmail(testRawEmail);

    expect(result).toHaveProperty('totalReports');
    expect(result).toHaveProperty('totalFailures');
    expect(result).toHaveProperty('failures');
    expect(result.totalReports).toBeGreaterThan(0);
  });

  it('should parse a DMARC report from a raw email with a zip attachment', async () => {
    const testRawEmail = readFileSync(join(__dirname, "./test/fixtures/email/email-source-with-zip.txt"), "utf-8");

    const result = await parseDmarcReportFromEmail(testRawEmail);

    expect(result).toHaveProperty('totalReports');
    expect(result).toHaveProperty('totalFailures');
    expect(result).toHaveProperty('failures');
    expect(result.totalReports).toBeGreaterThan(0);
  });

  it('should return an empty result for an email without a DMARC report', async () => {
    const emptyEmail = 'Subject: Test Email\r\n\r\nThis is a test email without a DMARC report.';
    await expect(parseDmarcReportFromEmail(emptyEmail)).rejects.toThrowError();
  });

  it('should throw an error for an invalid email input', async () => {
    const invalidEmail = 'This is not a valid email';
    await expect(parseDmarcReportFromEmail(invalidEmail)).rejects.toThrowError();
  });
});
