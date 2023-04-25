# DMARC Report Parser

This module provides a set of functions to parse DMARC reports contained within email attachments, as well as directly from XML strings or Buffers. The main functions are:

- `parseDmarcReportFromEmail(rawEmail: string)`
- `parseDmarcReportsFromXml(xmlFiles: (string | Buffer)[])`

## Installation

```sh
npm install --save dmarc-report-parser
```

```sh
yarn add dmarc-report-parser
```

## Usage

### Parsing DMARC reports from an email

```ts
import { parseDmarcReportFromEmail } from "dmarc-report-parser";

const rawEmail = "..."; // The raw email source

try {
  const result = await parseDmarcReportFromEmail(rawEmail);
  console.log(result);
} catch (error) {
  console.error("Failed to parse DMARC report:", error.message);
}
```

### Parsing DMARC reports from XML files

```ts
import { parseDmarcReportsFromXml } from "dmarc-report-parser";

const xmlFiles = ["..."]; // An array of XML strings or Buffers

try {
  const result = await parseDmarcReportsFromXml(xmlFiles);
  console.log(result);
} catch (error) {
  console.error("Failed to parse DMARC report:", error.message);
}
```

## API

### `parseDmarcReportFromEmail(rawEmail: string)`

Parses a DMARC report from a raw email message. The DMARC report can be contained in a .zip, .gz or .xml attachment.

- `rawEmail`: The raw email string.

Returns a Promise that resolves with the parsed DMARC report, or rejects with an error if the email does not contain a DMARC report.

### `parseDmarcReportsFromXml(xmlFiles: (string | Buffer)[])`

Parses DMARC reports from an array of XML strings or Buffers.

- `xmlFiles`: An array of XML strings or Buffers.

Returns a Promise that resolves with an object containing the parsed DMARC reports and additional information, or rejects with an error if the XML is not valid or does not match the DMARC schema.

The returned object contains the following properties:

- `totalReports`: The total number of DMARC reports parsed.
- `totalFailures`: The total number of DMARC failures where disposition is not `none`
- `failures`: An array of DMARC failures.
- `dkimFailures`: An array of DKIM failures.
- `spfFailures`: An array of SPF failures.
- `reports`: The parsed DMARC reports.

## License

MIT


