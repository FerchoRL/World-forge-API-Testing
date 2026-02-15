@api @character @update @thisone
Feature: Character – Update (PATCH /characters/:id)

  Background:
    Given the Character service is available

  @tc-char-update-01
  Scenario: TC-CHAR-UPDATE-01 – Multiple fields update – Returns 200
    When I update an existing character with multiple valid fields
    Then the character update should be successful
    And the updated character should reflect the changes from the update payload
    And the updated character should be stored in the database

  @tc-char-update-02
  Scenario: TC-CHAR-UPDATE-02 – Valid categories update – Returns 200
    When I update an existing character with valid categories
    Then the character update should be successful
    And the updated character should reflect the changes from the update payload
    And the updated character should be stored in the database

  @tc-char-update-03
  Scenario: TC-CHAR-UPDATE-03 – Valid inspirations update – Returns 200
    When I update an existing character with valid inspirations
    Then the character update should be successful
    And the updated character should reflect the changes from the update payload
    And the updated character should be stored in the database

  @tc-char-update-04
  Scenario: TC-CHAR-UPDATE-04 – Missing character ID – Returns 404
    When I attempt to update a character without providing an ID
    Then the character update should fail with status 404
    And the updated character error message should be "Route not found"

  @tc-char-update-05
  Scenario: TC-CHAR-UPDATE-05 – Non-existent character ID – Returns 404
    When I attempt to update a character with a non-existent ID
    Then the character update should fail with status 404
    And the updated character error message should be "Character not found after update"

  @tc-char-update-06
  Scenario: TC-CHAR-UPDATE-06 – Unsupported field (status) – Returns 400
    When I attempt to update a character with an unsupported field status
    Then the character update should fail with status 400
    And the updated character error message should be "Patch contains unsupported fields: status"

  @tc-char-update-07
  Scenario Outline: TC-CHAR-UPDATE-07 – Invalid name variations – Returns 400
    When I update a character with invalid name type <type>
    Then the character update should fail with status 400
    And the updated character error message should be "Character Name is required"

    Examples:
      | type         |
      | empty        |
      | spaces       |
      | null         |
      | booleanFalse |
      | booleanTrue  |

  @tc-char-update-07b
  Scenario: TC-CHAR-UPDATE-07B – Duplicate character name – Returns 409
    When I attempt to update a character with an already existing name
    Then the character update should fail with status 409
    And the updated character error message should be "Character with this name already exists"

  @tc-char-update-08
  Scenario Outline: TC-CHAR-UPDATE-08 – Invalid identity variations – Returns 400
    When I update a character with invalid identity type <type>
    Then the character update should fail with status 400
    And the updated character error message should be "Character Identity is required"

    Examples:
      | type         |
      | empty        |
      | spaces       |
      | null         |
      | booleanFalse |
      | booleanTrue  |

  @tc-char-update-09
  Scenario Outline: TC-CHAR-UPDATE-09 – Invalid categories type – Returns 400
    When I update a character with invalid categories type <type>
    Then the character update should fail with status 400
    And the updated character error message should be "<expectedError>"

    Examples:
      | type         | expectedError                     |
      | null         | Categories must be an array       |
      | booleanTrue  | Categories must be an array       |
      | booleanFalse | Categories must be an array       |
      | number       | Categories must be an array       |
      | string       | Categories must be an array       |
      | empty        | At least one Category is required |

  @tc-char-update-10
  Scenario Outline: TC-CHAR-UPDATE-10 – Invalid category value – Returns 400
    When I update a character with invalid category value "<category>"
    Then the character update should fail with status 400
    And the updated character error message should be "Category <category> is not valid"

    Examples:
      | category    |
      | Villano     |
      | HeroeOscuro |
      |         123 |

  @tc-char-update-11
  Scenario: TC-CHAR-UPDATE-11 – Duplicate categories – Returns 400
    When I update a character with duplicated categories
    Then the character update should fail with status 400
    And the updated character error message should be "Categories must not contain duplicates"

  @tc-char-update-12
  Scenario Outline: TC-CHAR-UPDATE-12 – Invalid inspirations type – Returns 400
    When I update a character with invalid inspirations type "<type>"
    Then the character update should fail with status 400
    And the updated character error message should be "<expectedError>"

    Examples:
      | type         | expectedError                        |
      | null         | Inspirations must be an array        |
      | booleanTrue  | Inspirations must be an array        |
      | booleanFalse | Inspirations must be an array        |
      | number       | Inspirations must be an array        |
      | string       | Inspirations must be an array        |
      | empty        | At least one Inspiration is required |

  @tc-char-update-13
  Scenario Outline: TC-CHAR-UPDATE-13 – Invalid inspiration item – Returns 400
    When I update a character with invalid inspiration item <value>
    Then the character update should fail with status 400
    And the updated character error message should be "Each Inspiration must be a non-empty string"

    Examples:
      | value  |
      | ""     |
      | "   "  |
      | "123"  |
      | "true" |

  @tc-char-update-14
  Scenario Outline: TC-CHAR-UPDATE-14 – Invalid notes type – Returns 400
    When I update a character with invalid notes type "<type>"
    Then the character update should fail with status 400
    And the updated character error message should be "Notes must be a string"

    Examples:
      | type         |
      | null         |
      | booleanTrue  |
      | booleanFalse |
      | number       |

  @tc-char-update-15
  Scenario: TC-CHAR-UPDATE-15A – Empty patch body – Returns 400
    When I update a character with an empty body
    Then the character update should fail with status 400
    And the updated character error message should be "Patch must include at least one updatable field"
