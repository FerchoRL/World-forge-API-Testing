@api @universe @universe-change-status
Feature: Universe – Change Status (PATCH /universes/:id/status)

  Background:
    Given the Universe service is available

  @tc-universe-change-status-01 @tc-universe-change-status-02 @tc-universe-change-status-03
  Scenario Outline: TC-UNIVERSE-CHANGE-STATUS-01/02/03 – Valid transitions – Returns 200
    When I request to change universe status from "<from>" to "<to>"
    Then the change universe status request should return status code <statusCode>
    And the changed universe status should be <to>
    And the changed universe id should match the source universe id

    Examples:
      | from     | to       | statusCode |
      | DRAFT    | ACTIVE   | 200        |
      | ACTIVE   | ARCHIVED | 200        |
      | ARCHIVED | ACTIVE   | 200        |

  @tc-universe-change-status-04
  Scenario Outline: TC-UNIVERSE-CHANGE-STATUS-04 – Empty/blank id – Returns 400
    When I request to change universe status using id "<id>"
    Then the change universe status request should return status code 400
    And the change universe status error should be "Universe id is required"

    Examples:
      | id        |
      | %20       |
      | __SPACE__ |

  @tc-universe-change-status-05
  Scenario Outline: TC-UNIVERSE-CHANGE-STATUS-05 – Invalid status in request – Returns 400
    When I request to change universe status using invalid status "<status>"
    Then the change universe status request should return status code 400
    And the change universe status error should be "Status must be ACTIVE or ARCHIVED"

    Examples:
      | status  |
      | 123     |
      | INVALID |
      | active  |

  @tc-universe-change-status-06
  Scenario Outline: TC-UNIVERSE-CHANGE-STATUS-06 – Transition not allowed – Returns 400
    When I request to change universe status from "<from>" to "<to>"
    Then the change universe status request should return status code 400
    And the change universe status error should be "Status transition <from> -> <to> is not allowed"

    Examples:
      | from     | to       |
      | DRAFT    | ARCHIVED |
      | ARCHIVED | ARCHIVED |
      | ACTIVE   | ACTIVE   |

  @tc-universe-change-status-07
  Scenario Outline: TC-UNIVERSE-CHANGE-STATUS-07 – Non-existing string id – Returns 404
    When I request to change universe status using id "<id>"
    Then the change universe status request should return status code 404
    And the change universe status error should be "Universe <id> not found"

    Examples:
      | id    |
      | false |
      | null  |
      | abc   |

  @tc-universe-change-status-08
  Scenario: TC-UNIVERSE-CHANGE-STATUS-08 – Reactivation uniqueness conflict – Returns 409
    When I archive a new active universe for reactivation conflict validation
    And I create a new active universe with the archived universe name
    And I request to reactivate the archived universe
    Then the change universe status request should return status code 409
    And the change universe status error should be "Universe name already exists for an ACTIVE or DRAFT universe"
