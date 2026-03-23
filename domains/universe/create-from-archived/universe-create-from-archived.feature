@api @universe @universe-create-from-archived @this
Feature: Universe - Create from archived (POST /universes/:id/create-from-archived)

  Background:
    Given the Universe service is available

  @tc-universe-create-from-archived-01
  Scenario: TC-UNIVERSE-CREATE-FROM-ARCHIVED-01 - Creates a new Universe from an ARCHIVED source - Returns 201
    Given I have an archived source universe for create from archived
    When I create a universe from the archived source
    Then the create from archived universe endpoint should respond with status code 201
    And the created universe from archived should have a different id than source
    And the created universe from archived should default status to DRAFT
    And the created universe from archived should preserve the archived source data

  @tc-universe-create-from-archived-02
  Scenario: TC-UNIVERSE-CREATE-FROM-ARCHIVED-02 - Does not modify the archived source Universe - Returns 201
    Given I have an archived source universe for create from archived
    When I create a universe from the archived source
    Then the create from archived universe endpoint should respond with status code 201
    And the archived source universe should remain unchanged after creation

  @tc-universe-create-from-archived-03
  Scenario: TC-UNIVERSE-CREATE-FROM-ARCHIVED-03 - Source Universe does not exist - Returns 404
    When I create a universe from a non existing archived source
    Then the create from archived universe endpoint should respond with status code 404
    And the create from archived universe error message should be "Universe universe-does-not-exist not found"

  @tc-universe-create-from-archived-04
  Scenario Outline: TC-UNIVERSE-CREATE-FROM-ARCHIVED-04 - Invalid or blank sourceUniverseId - Returns 400
    When I create a universe from archived source id "<id>"
    Then the create from archived universe endpoint should respond with status code 400
    And the create from archived universe error message should be "Source universe id is required"

    Examples:
      | id        |
      | %20       |
      | __SPACE__ |

  @tc-universe-create-from-archived-05
  Scenario Outline: TC-UNIVERSE-CREATE-FROM-ARCHIVED-05 - Source Universe is not in ARCHIVED status - Returns 400
    Given I have a non archived source universe for create from archived with status "<status>"
    When I create a universe from the non archived source
    Then the create from archived universe endpoint should respond with status code 400
    And the create from archived universe error message should be "Only ARCHIVED universes can be used as source"

    Examples:
      | status |
      | ACTIVE |
      | DRAFT  |

  @tc-universe-create-from-archived-06
  Scenario Outline: TC-UNIVERSE-CREATE-FROM-ARCHIVED-06 - Duplicate name against ACTIVE or DRAFT universe - Returns 409
    Given I have an archived source universe for create from archived with duplicated name against status "<status>"
    When I create a universe from the archived source
    Then the create from archived universe endpoint should respond with status code 409
    And the create from archived universe error message should be "Universe name already exists for an ACTIVE or DRAFT universe"

    Examples:
      | status |
      | ACTIVE |
      | DRAFT  |
