@api @universe @universe-update
Feature: Universe – Update (PATCH /universes/:id)

  Background:
    Given the Universe service is available

  @tc-universe-update-01
  Scenario: TC-UNIVERSE-UPDATE-01 – Update múltiple exitoso (name + premise + notes + rules) – Returns 200
    When I update an existing universe with multiple valid fields
    Then the universe update should be successful
    And the updated universe should reflect the changes from the update payload
    And the updated universe should be stored in the database

  @tc-universe-update-02 @tc-universe-update-03 @tc-universe-update-04 @tc-universe-update-05
  Scenario Outline: TC-UNIVERSE-UPDATE-02/03/04/05 – Single field update – Returns 200
    When I update an existing universe with a single valid field "<field>"
    Then the universe update should be successful
    And the updated universe should reflect the changes from the update payload
    And the updated universe should be stored in the database

    Examples:
      | field   |
      | name    |
      | premise |
      | notes   |
      | rules   |

  @tc-universe-update-06
  Scenario: TC-UNIVERSE-UPDATE-06 – Body vacío (sin campos) – Returns 400
    When I update a universe with an empty body
    Then the universe update should fail with status 400
    And the updated universe error message should be "Patch must include at least one updatable field"

  @tc-universe-update-07
  Scenario Outline: TC-UNIVERSE-UPDATE-07 – Body inválido (no objeto) – Returns 400
    When I update a universe with invalid non-object body type "<type>"
    Then the universe update should fail with status 400
    And the updated universe error message should be "<message>"

    Examples:
      | type         | message                      |
      | array        | Patch must be a valid object |
      | string       | Invalid JSON body            |
      | number       | Invalid JSON body            |
      | booleanTrue  | Invalid JSON body            |
      | booleanFalse | Invalid JSON body            |

  @tc-universe-update-08
  Scenario: TC-UNIVERSE-UPDATE-08 – Campo no soportado en patch (status) – Returns 400
    When I attempt to update a universe with an unsupported field status
    Then the universe update should fail with status 400
    And the updated universe error message should be "Patch contains unsupported fields: status"

  @tc-universe-update-09
  Scenario: TC-UNIVERSE-UPDATE-09 – Campos mixtos con no soportado – Returns 400
    When I attempt to update a universe with mixed valid and unsupported fields
    Then the universe update should fail with status 400
    And the updated universe error message should be "Patch contains unsupported fields: status"

  @tc-universe-update-10
  Scenario Outline: TC-UNIVERSE-UPDATE-10 – Invalid name variations – Returns 400
    When I update a universe with invalid name type <type>
    Then the universe update should fail with status 400
    And the updated universe error message should be "<expectedError>"

    Examples:
      | type         | expectedError                 |
      | empty        | Universe name is required     |
      | spaces       | Universe name is required     |
      | null         | Universe name must be a string |
      | booleanFalse | Universe name must be a string |
      | booleanTrue  | Universe name must be a string |
      | number       | Universe name must be a string |

  @tc-universe-update-11
  Scenario Outline: TC-UNIVERSE-UPDATE-11 – Invalid premise variations – Returns 400
    When I update a universe with invalid premise type <type>
    Then the universe update should fail with status 400
    And the updated universe error message should be "<expectedError>"

    Examples:
      | type         | expectedError                    |
      | empty        | Universe premise is required     |
      | spaces       | Universe premise is required     |
      | null         | Universe premise must be a string |
      | booleanFalse | Universe premise must be a string |
      | booleanTrue  | Universe premise must be a string |
      | number       | Universe premise must be a string |

  @tc-universe-update-12
  Scenario Outline: TC-UNIVERSE-UPDATE-12 – Invalid rules type – Returns 400
    When I update a universe with invalid rules type <type>
    Then the universe update should fail with status 400
    And the updated universe error message should be "Universe rules must be an array"

    Examples:
      | type         |
      | null         |
      | booleanTrue  |
      | booleanFalse |
      | number       |
      | string       |

  @tc-universe-update-13 @tc-universe-update-14
  Scenario Outline: TC-UNIVERSE-UPDATE-13/14 – Invalid rule item value – Returns 400
    When I update a universe with invalid rule item value <value>
    Then the universe update should fail with status 400
    And the updated universe error message should be "<expectedError>"

    Examples:
      | value    | expectedError                            |
      | "123"   | Each universe rule must be a string      |
      | "true"  | Each universe rule must be a string      |
      | "false" | Each universe rule must be a string      |
      | "null"  | Each universe rule must be a string      |
      | ""      | Universe rules cannot contain empty values |
      | "   "   | Universe rules cannot contain empty values |

  @tc-universe-update-15
  Scenario: TC-UNIVERSE-UPDATE-15 – Duplicated rules (case-insensitive, trim-aware) – Returns 400
    When I update a universe with duplicated rules considering case and spaces
    Then the universe update should fail with status 400
    And the updated universe error message should be "Universe rules must not contain duplicates"

  @tc-universe-update-16 @tc-universe-update-17
  Scenario Outline: TC-UNIVERSE-UPDATE-16/17 – Invalid notes value – Returns 400
    When I update a universe with invalid notes value <value>
    Then the universe update should fail with status 400
    And the updated universe error message should be "<expectedError>"

    Examples:
      | value    | expectedError                    |
      | "null"  | Universe notes must be a string  |
      | "false" | Universe notes must be a string  |
      | "true"  | Universe notes must be a string  |
      | "123"   | Universe notes must be a string  |
      | ""      | Universe notes cannot be empty   |
      | "   "   | Universe notes cannot be empty   |

  @tc-universe-update-18
  Scenario: TC-UNIVERSE-UPDATE-18 – Universe does not exist – Returns 404
    When I attempt to update a universe with a non-existent ID
    Then the universe update should fail with status 404
    And the updated universe error message should be "Universe not found"

  @tc-universe-update-19
  Scenario Outline: TC-UNIVERSE-UPDATE-19 – Duplicate universe name against ACTIVE/DRAFT – Returns 409
    When I attempt to update a universe with an already existing name from status "<status>"
    Then the universe update should fail with status 409
    And the updated universe error message should be "Universe name already exists for an ACTIVE or DRAFT universe"

    Examples:
      | status |
      | ACTIVE |
      | DRAFT  |

  @tc-universe-update-20
  Scenario: TC-UNIVERSE-UPDATE-20 – Blank universe id – Returns 400
    When I attempt to update a universe with a blank ID
    Then the universe update should fail with status 400
    And the updated universe error message should be "Universe id is required"
