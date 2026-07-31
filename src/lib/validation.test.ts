import {
  validateConfirmPassword,
  validateDateOfBirth,
  validateDirectionStep,
  validateEmail,
  validateIngredientName,
  validateIngredientQuantity,
  validateName,
  validatePassword,
  validatePhoneNumber,
  validateRecipeDescription,
  validateRecipeImageFile,
  validateRecipeName,
  validateRecipeNotes,
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

describe("validateRecipeName", () => {
  it("accepts a valid name", () => {
    expect(validateRecipeName("Pancakes")).toBeNull();
  });

  it("rejects an empty name", () => {
    expect(validateRecipeName("")).not.toBeNull();
  });

  it("rejects a whitespace-only name", () => {
    expect(validateRecipeName("   ")).not.toBeNull();
  });

  it("accepts exactly 60 characters", () => {
    expect(validateRecipeName("x".repeat(60))).toBeNull();
  });

  it("rejects more than 60 characters", () => {
    expect(validateRecipeName("x".repeat(61))).not.toBeNull();
  });
});

describe("validateRecipeDescription / validateRecipeNotes", () => {
  it("treats empty as valid (optional field)", () => {
    expect(validateRecipeDescription("")).toBeNull();
    expect(validateRecipeNotes("")).toBeNull();
  });

  it("accepts exactly 4098 characters", () => {
    expect(validateRecipeDescription("x".repeat(4098))).toBeNull();
  });

  it("rejects more than 4098 characters", () => {
    expect(validateRecipeDescription("x".repeat(4099))).not.toBeNull();
    expect(validateRecipeNotes("x".repeat(4099))).not.toBeNull();
  });
});

describe("validateIngredientQuantity", () => {
  it("accepts a valid quantity", () => {
    expect(validateIngredientQuantity(2)).toBeNull();
  });

  it("accepts a fractional quantity", () => {
    expect(validateIngredientQuantity(0.5)).toBeNull();
  });

  it("rejects null (unparseable input)", () => {
    expect(validateIngredientQuantity(null)).not.toBeNull();
  });

  it("rejects zero and negative quantities", () => {
    expect(validateIngredientQuantity(0)).not.toBeNull();
    expect(validateIngredientQuantity(-1)).not.toBeNull();
  });

  it("rejects quantities over 99", () => {
    expect(validateIngredientQuantity(100)).not.toBeNull();
  });

  it("accepts the 99 boundary", () => {
    expect(validateIngredientQuantity(99)).toBeNull();
  });
});

describe("validateIngredientName", () => {
  it("accepts a valid name", () => {
    expect(validateIngredientName("vanilla")).toBeNull();
  });

  it("rejects an empty name", () => {
    expect(validateIngredientName("")).not.toBeNull();
  });

  it("rejects more than 30 characters", () => {
    expect(validateIngredientName("x".repeat(31))).not.toBeNull();
  });
});

describe("validateDirectionStep", () => {
  it("accepts a valid step", () => {
    expect(validateDirectionStep("Mix everything together.")).toBeNull();
  });

  it("rejects an empty step", () => {
    expect(validateDirectionStep("")).not.toBeNull();
  });

  it("rejects more than 255 characters", () => {
    expect(validateDirectionStep("x".repeat(256))).not.toBeNull();
  });
});

describe("validateRecipeImageFile", () => {
  function makeFile(type: string, sizeBytes: number): File {
    return { type, size: sizeBytes } as File;
  }

  it("accepts a small JPEG", () => {
    expect(validateRecipeImageFile(makeFile("image/jpeg", 1024))).toBeNull();
  });

  it("rejects a non-image file type", () => {
    expect(validateRecipeImageFile(makeFile("text/plain", 1024))).not.toBeNull();
  });

  it("rejects a file over 2MB", () => {
    expect(validateRecipeImageFile(makeFile("image/png", 2 * 1024 * 1024 + 1))).not.toBeNull();
  });

  it("accepts a file exactly at the 2MB boundary", () => {
    expect(validateRecipeImageFile(makeFile("image/png", 2 * 1024 * 1024))).toBeNull();
  });
});
