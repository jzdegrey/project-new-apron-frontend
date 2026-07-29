import {
  validateConfirmPassword,
  validateDateOfBirth,
  validateEmail,
  validateName,
  validatePassword,
  validatePhoneNumber,
  validateUsername,
} from "./validation";

function isoDateYearsAgo(years: number, extraDays = 0): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  date.setDate(date.getDate() + extraDays);
  return date.toISOString().slice(0, 10);
}

describe("validateUsername", () => {
  it("accepts a valid username", () => {
    expect(validateUsername("validuser1")).toBeNull();
  });

  it.each(["abcd", "a".repeat(33), "has spaces", "has-dash"])(
    "rejects %s",
    (value) => {
      expect(validateUsername(value)).not.toBeNull();
    }
  );
});

describe("validatePassword", () => {
  it("accepts a valid password", () => {
    expect(validatePassword("sup3rSecret!")).toBeNull();
  });

  it("rejects passwords that are too short", () => {
    expect(validatePassword("short")).not.toBeNull();
  });

  it("rejects passwords that are too long", () => {
    expect(validatePassword("a".repeat(65))).not.toBeNull();
  });
});

describe("validateConfirmPassword", () => {
  it("accepts a match", () => {
    expect(validateConfirmPassword("secret1", "secret1")).toBeNull();
  });

  it("rejects a mismatch", () => {
    expect(validateConfirmPassword("secret1", "secret2")).not.toBeNull();
  });
});

describe("validateName", () => {
  it("accepts letters, numbers, spaces, dashes, underscores", () => {
    expect(validateName("Mary-Jane_Anne 2")).toBeNull();
  });

  it("rejects names that are too short", () => {
    expect(validateName("ab")).not.toBeNull();
  });

  it("rejects symbols outside the allowed set", () => {
    expect(validateName("has$ymbol")).not.toBeNull();
  });
});

describe("validateDateOfBirth", () => {
  it("accepts someone exactly 18 today", () => {
    expect(validateDateOfBirth(isoDateYearsAgo(18))).toBeNull();
  });

  it("rejects a future date", () => {
    expect(validateDateOfBirth(isoDateYearsAgo(-1))).not.toBeNull();
  });

  it("rejects someone under 18", () => {
    expect(validateDateOfBirth(isoDateYearsAgo(18, 1))).not.toBeNull();
  });

  it("rejects an empty value", () => {
    expect(validateDateOfBirth("")).not.toBeNull();
  });
});

describe("validateEmail", () => {
  it("treats empty as valid (optional field)", () => {
    expect(validateEmail("")).toBeNull();
  });

  it("accepts a valid email", () => {
    expect(validateEmail("jane@example.com")).toBeNull();
  });

  it("rejects an invalid email", () => {
    expect(validateEmail("not-an-email")).not.toBeNull();
  });
});

describe("validatePhoneNumber", () => {
  it("treats empty as valid (optional field)", () => {
    expect(validatePhoneNumber("")).toBeNull();
  });

  it("accepts a valid phone number", () => {
    expect(validatePhoneNumber("+1 (555) 123-4567")).toBeNull();
  });

  it("rejects an invalid phone number", () => {
    expect(validatePhoneNumber("abc")).not.toBeNull();
  });
});
