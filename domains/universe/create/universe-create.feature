@api @universe @universe-create
Feature: Universe – Create (POST /universes)

  Background:
    Given the Universe service is available

  @tc-universe-create-01
  Scenario: TC-UNIVERSE-CREATE-01 – Crear universe con valores mínimos – Returns 201 and defaults to DRAFT
    When I create a universe with minimal valid payload
    Then the universe create endpoint should respond with status code 201
    And the universe response should contain the expected properties
    And the universe response properties should have the correct types
    And the created universe should default status to DRAFT
    And the created universe should be stored in the database

  @tc-universe-create-02
  Scenario Outline: TC-UNIVERSE-CREATE-02 – Crear universe con payload completo y status explícito (DRAFT | ACTIVE) – Returns 201
    When I create a universe with full valid payload and status <status>
    Then the universe create endpoint should respond with status code 201
    And the universe response should contain the expected properties
    And the universe response properties should have the correct types
    And the created universe response should match all values from the payload
    And the created universe should be stored in the database

    Examples:
      | status |
      | DRAFT  |
      | ACTIVE |

  @tc-universe-create-03
  Scenario Outline: TC-UNIVERSE-CREATE-03 – Invalid name (missing, non-string, empty/spaces) – Returns 400
    When I create a universe with invalid name type <type>
    Then the universe create endpoint should respond with status code 400
    And the universe create error message should be "Universe name is required"

    Examples:
      | type         |
      | empty        |
      | spaces       |
      | null         |
      | booleanFalse |
      | booleanTrue  |
      | missing      |

  @tc-universe-create-04
  Scenario Outline: TC-UNIVERSE-CREATE-04 – Invalid premise (missing, non-string, empty/spaces) – Returns 400
    When I create a universe with invalid premise type <type>
    Then the universe create endpoint should respond with status code 400
    And the universe create error message should be "Universe premise is required"

    Examples:
      | type         |
      | empty        |
      | spaces       |
      | null         |
      | booleanFalse |
      | booleanTrue  |
      | missing      |

  @tc-universe-create-05
  Scenario Outline: TC-UNIVERSE-CREATE-05 – rules is not array – Returns 400
    When I create a universe with invalid rules type <type>
    Then the universe create endpoint should respond with status code 400
    And the universe create error message should be "Universe rules must be an array"

    Examples:
      | type         |
      | null         |
      | booleanFalse |
      | booleanTrue  |
      | number       |
      | string       |

  @tc-universe-create-06
  Scenario Outline: TC-UNIVERSE-CREATE-06 – rules contains non-string item – Returns 400
    When I create a universe with invalid rule item <value>
    Then the universe create endpoint should respond with status code 400
    And the universe create error message should be "Each universe rule must be a string"

    Examples:
      | value   |
      | "123"  |
      | "true" |
      | "false"|
      | "null" |

  @tc-universe-create-07
  Scenario Outline: TC-UNIVERSE-CREATE-07 – rules contains empty/blank string – Returns 400
    When I create a universe with empty rule value <value>
    Then the universe create endpoint should respond with status code 400
    And the universe create error message should be "Universe rules cannot contain empty values"

    Examples:
      | value |
      | ""    |
      | "   " |

  @tc-universe-create-08
  Scenario: TC-UNIVERSE-CREATE-08 – rules contains duplicates (case-insensitive, trim-aware) – Returns 400
    When I create a universe with duplicated rules considering case and spaces
    Then the universe create endpoint should respond with status code 400
    And the universe create error message should be "Universe rules must not contain duplicates"

  @tc-universe-create-09
  Scenario Outline: TC-UNIVERSE-CREATE-09 – notes is not string – Returns 400
    When I create a universe with invalid notes type <type>
    Then the universe create endpoint should respond with status code 400
    And the universe create error message should be "Universe notes must be a string"

    Examples:
      | type         |
      | null         |
      | booleanFalse |
      | booleanTrue  |
      | number       |

  @tc-universe-create-10
  Scenario Outline: TC-UNIVERSE-CREATE-10 – notes empty/blank – Returns 400
    When I create a universe with invalid notes value <value>
    Then the universe create endpoint should respond with status code 400
    And the universe create error message should be "Universe notes cannot be empty"

    Examples:
      | value |
      | ""    |
      | "   " |
