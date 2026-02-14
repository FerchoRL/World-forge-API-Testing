@api @character @create
Feature: Character – Create (POST /characters)

  Background:
    Given the Character service is available

  @tc-char-create-01
  Scenario: TC-CHAR-CREATE-01 – Valid payload – Returns 201 and can be retrieved by ID
    When I create a character with a valid payload
    Then the character should be created successfully
    And the created character should match the payload
    And I request the created character by id
    And the created character should match the get-by-id response

  @tc-char-create-02
  Scenario: TC-CHAR-CREATE-02 – Missing status – Defaults to DRAFT
    When I create a character without status
    Then the character should be created successfully
    And the created character should have status DRAFT
    And the created character should be stored in the database

  @tc-char-create-03
  Scenario: TC-CHAR-CREATE-03 – Invalid status value – Returns 400
    When I create a character with an invalid status
    Then the created character should fail with status 400
    And the error message should indicate an invalid status

  @tc-char-create-04
  Scenario Outline: TC-CHAR-CREATE-04 – Invalid name variations – Returns 400
    When I create a character with invalid name type <type>
    Then the created character should fail with status 400
    And the character error message should be "Character Name is required"

    Examples:
      | type         |
      | empty        |
      | spaces       |
      | null         |
      | booleanFalse |
      | booleanTrue  |
      | missing      |

  @tc-char-create-05
  Scenario Outline: TC-CHAR-CREATE-05 – Invalid identity variations – Returns 400
    When I create a character with invalid identity type <type>
    Then the created character should fail with status 400
    And the character error message should be "Character Identity is required"

    Examples:
      | type         |
      | empty        |
      | spaces       |
      | null         |
      | booleanFalse |
      | booleanTrue  |
      | missing      |

  @tc-char-create-06
  Scenario Outline: TC-CHAR-CREATE-06 – Categories validation – Returns 400
    When I create a character with invalid categories type <type>
    Then the created character should fail with status 400
    And the character error message should be "<expectedError>"

    Examples:
      | type         | expectedError                     |
      | missing      | Categories must be an array       |
      | null         | Categories must be an array       |
      | booleanTrue  | Categories must be an array       |
      | booleanFalse | Categories must be an array       |
      | number       | Categories must be an array       |
      | string       | Categories must be an array       |
      | empty        | At least one Category is required |

  @tc-char-create-07
  Scenario Outline: TC-CHAR-CREATE-07 – Invalid category value – Returns 400
    When I create a character with invalid category value "<category>"
    Then the created character should fail with status 400
    And the character error message should be "Category <category> is not valid"

    Examples:
      | category    |
      | Villano     |
      | HeroeOscuro |
      |         123 |

  @tc-char-create-08
  Scenario Outline: TC-CHAR-CREATE-08 – Mixed valid and invalid categories – Returns 400
    When I create a character with mixed valid and invalid categories including "<category>"
    Then the created character should fail with status 400
    And the character error message should be "Category <category> is not valid"

    Examples:
      | category          |
      | CategoriaInvalida |

  @tc-char-create-09
  Scenario: TC-CHAR-CREATE-09 – Duplicate categories – Returns 400
    When I create a character with duplicated categories
    Then the created character should fail with status 400
    And the character error message should be "Categories must not contain duplicates"

  @tc-char-create-10
  Scenario Outline: TC-CHAR-CREATE-10A – Invalid inspirations type – Returns 400
    When I create a character with invalid inspirations type "<type>"
    Then the created character should fail with status 400
    And the character error message should be "<expectedError>"

    Examples:
      | type         | expectedError                        |
      | missing      | Inspirations must be an array        |
      | null         | Inspirations must be an array        |
      | booleanTrue  | Inspirations must be an array        |
      | booleanFalse | Inspirations must be an array        |
      | number       | Inspirations must be an array        |
      | string       | Inspirations must be an array        |
      | empty        | At least one Inspiration is required |

  @tc-char-create-11
  Scenario Outline: TC-CHAR-CREATE-10B – Invalid inspiration item – Returns 400
    When I create a character with invalid inspiration item <value>
    Then the created character should fail with status 400
    And the character error message should be "Each Inspiration must be a non-empty string"

    Examples:
      | value  |
      | ""     |
      | "   "  |
      | "123"  |
      | "true" |

  @tc-char-create-12
  Scenario: TC-CHAR-CREATE-12A – Missing notes – Still valid
    When I create a character without notes
    Then the character should be created successfully
    And the created character should not contain notes
    And the created character should be stored in the database

  @tc-char-create-13
  Scenario Outline: TC-CHAR-CREATE-12B – Invalid notes type – Returns 400
    When I create a character with invalid notes type "<type>"
    Then the created character should fail with status 400
    And the character error message should be "Notes must be a string"

    Examples:
      | type         |
      | null         |
      | booleanTrue  |
      | booleanFalse |
      | number       |

  @tc-char-create-14
  Scenario Outline: TC-CHAR-CREATE-12C – Empty notes – Returns 400
    When I create a character with invalid notes value <value>
    Then the created character should fail with status 400
    And the character error message should be "Notes cannot be empty"

    Examples:
      | value |
      | ""    |
      | "   " |

  @tc-char-create-15
  Scenario: TC-CHAR-CREATE-15 – Extra unknown fields – Ignored
    When I create a character with extra unknown fields
    Then the character should be created successfully
    And the created character should not contain unknown fields
    And I request the created character by id
    And the created character should match the get-by-id response

  @tc-char-create-16
  Scenario: TC-CHAR-CREATE-11 – Persisted data matches database
    When I create a character with a valid payload
    Then the character should be created successfully
    And the created character should match the payload
    And the created character should be stored in the database
