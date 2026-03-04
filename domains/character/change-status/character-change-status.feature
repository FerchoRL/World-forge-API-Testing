@api @character @character-change-status
Feature: Character – Change Status (PATCH /characters/:id/status)

  Background:
    Given the Character service is available

  @tc-char-change-status-01 @tc-char-change-status-02 @tc-char-change-status-03
  Scenario Outline: TC-CHAR-CHANGE-STATUS-01/02/03 – Valid transitions – Returns 200
    When I request to change character status from "<from>" to "<to>"
    Then the change character status request should return status code 200
    And the changed character status should be <to>
    And the changed character id should match the source character id

    Examples:
      | from     | to       |
      | DRAFT    | ACTIVE   |
      | ACTIVE   | ARCHIVED |
      | ARCHIVED | ACTIVE   |

  @tc-char-change-status-04
  Scenario Outline: TC-CHAR-CHANGE-STATUS-04 – Empty/blank id – Returns 400
    When I request to change character status using id "<id>"
    Then the change character status request should return status code 400
    And the change character status error should be "Character id is required"

    Examples:
      | id        |
      | %20       |
      | __SPACE__ |

  @tc-char-change-status-05
  Scenario Outline: TC-CHAR-CHANGE-STATUS-05 – Invalid status in request – Returns 400
    When I request to change character status using invalid status "<status>"
    Then the change character status request should return status code 400
    And the change character status error should be "Status must be ACTIVE or ARCHIVED"

    Examples:
      | status  |
      |     123 |
      | INVALID |
      | active  |

  @tc-char-change-status-06
  Scenario Outline: TC-CHAR-CHANGE-STATUS-06 – Transition not allowed – Returns 400
    When I request to change character status from "<from>" to "<to>"
    Then the change character status request should return status code 400
    And the change character status error should be "Status transition <from> -> <to> is not allowed"

    Examples:
      | from     | to       |
      | ACTIVE   | ACTIVE   |
      | ARCHIVED | ARCHIVED |

  @tc-char-change-status-07
  Scenario Outline: TC-CHAR-CHANGE-STATUS-07 – Non-existing string id – Returns 404
    When I request to change character status using id "<id>"
    Then the change character status request should return status code 404
    And the change character status error should be "Character <id> not found"

    Examples:
      | id    |
      | false |
      | null  |
      | abc   |

  @tc-char-change-status-08
  Scenario: TC-CHAR-CHANGE-STATUS-08 – Reactivation uniqueness conflict – Returns 409
    When I archive a new active character for reactivation conflict validation
    And I create a new active character with the archived character name
    And I request to reactivate the archived character
    Then the change character status request should return status code 409
    And the change character status error should be "Character name already exists for an ACTIVE or DRAFT character"
