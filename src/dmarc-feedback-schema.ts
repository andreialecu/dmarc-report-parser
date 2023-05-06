import camelcaseKeys from "camelcase-keys";
import { CamelCasedPropertiesDeep } from "type-fest";
import { ZodEffects, z } from "zod";

const zodToCamelCase = <T extends z.ZodTypeAny>(
  zod: T
): ZodEffects<z.ZodTypeAny, CamelCasedPropertiesDeep<T["_output"]>> =>
  zod.transform((val) => camelcaseKeys(val) as CamelCasedPropertiesDeep<T>);

// Shared function for refining and transforming arrays with maxOccurs = 1
const singleItem = <T extends z.ZodTypeAny>(schema: T) => {
  return schema
    .array()
    .refine((data) => data.length === 1, {
      message: "Must be an array of length 1",
    })
    .transform(([singleItem]) => singleItem);
};

const DateRangeType = zodToCamelCase(
  z.object({
    begin: singleItem(z.coerce.number().int()),
    end: singleItem(z.coerce.number().int()),
  })
);

const ReportMetadataType = zodToCamelCase(
  z.object({
    org_name: singleItem(z.string()),
    email: singleItem(z.string()),
    extra_contact_info: singleItem(z.string()).optional(),
    report_id: singleItem(z.string()),
    date_range: singleItem(DateRangeType),
    error: z.array(z.string()).optional(),
  })
);

const AlignmentType = z.enum(["r", "s"]);

const DispositionType = z.enum(["none", "quarantine", "reject"]);

const PolicyPublishedType = zodToCamelCase(
  z.object({
    domain: singleItem(z.string()),
    adkim: singleItem(AlignmentType).optional(),
    aspf: singleItem(AlignmentType).optional(),
    p: singleItem(DispositionType).optional(),
    sp: singleItem(DispositionType).optional(),
    pct: singleItem(z.coerce.number().int()).optional(),
    fo: singleItem(z.string()).optional(),
  })
);

const DMARCResultType = z.enum(["pass", "fail"]);

const PolicyOverrideType = z.enum([
  "forwarded",
  "sampled_out",
  "trusted_forwarder",
  "mailing_list",
  "local_policy",
  "other",
]);

const PolicyOverrideReason = zodToCamelCase(
  z.object({
    type: PolicyOverrideType,
    comment: z.string().optional(),
  })
);

const PolicyEvaluatedType = zodToCamelCase(
  z.object({
    disposition: singleItem(DispositionType),
    dkim: singleItem(DMARCResultType),
    spf: singleItem(DMARCResultType),
    reason: z.array(PolicyOverrideReason).optional(),
  })
);

const IPAddress = z.string().ip();

const RowType = zodToCamelCase(
  z.object({
    source_ip: singleItem(IPAddress),
    count: singleItem(z.coerce.number().int()),
    policy_evaluated: singleItem(PolicyEvaluatedType),
  })
);

const IdentifierType = zodToCamelCase(
  z.object({
    envelope_to: singleItem(z.string()).optional(),
    envelope_from: singleItem(z.string()).optional(),
    header_from: singleItem(z.string()),
  })
);

const DKIMResultType = z.enum([
  "none",
  "pass",
  "fail",
  "policy",
  "neutral",
  "temperror",
  "permerror",
]);

const DKIMAuthResultType = zodToCamelCase(
  z.object({
    domain: singleItem(z.string()),
    selector: singleItem(z.string()).optional(),
    result: singleItem(DKIMResultType),
    human_result: singleItem(z.string()).optional(),
  })
);

const SPFDomainScope = z.enum(["helo", "mfrom"]);

const SPFResultType = z.enum([
  "none",
  "neutral",
  "pass",
  "fail",
  "softfail",
  "temperror",
  "permerror",
]);

const SPFAuthResultType = zodToCamelCase(
  z.object({
    domain: singleItem(z.string()),
    scope: singleItem(SPFDomainScope).optional(),
    result: singleItem(SPFResultType),
  })
);

const AuthResultType = zodToCamelCase(
  z.object({
    dkim: z.array(DKIMAuthResultType).optional(),
    spf: z.array(SPFAuthResultType),
  })
);

const RecordType = zodToCamelCase(
  z.object({
    row: singleItem(RowType),
    identifiers: singleItem(IdentifierType),
    auth_results: singleItem(AuthResultType),
  })
);

export const DmarcFeedbackSchema = zodToCamelCase(
  z.object({
    version: singleItem(z.coerce.number()).optional(),
    report_metadata: singleItem(ReportMetadataType).optional(),
    policy_published: singleItem(PolicyPublishedType),
    record: z.array(RecordType),
  })
);

export type DmarcFeedback = z.infer<typeof DmarcFeedbackSchema>;
export type DmarcFeedbackRecord = z.infer<typeof RecordType>;