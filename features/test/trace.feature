Feature: Allure trace attachments

  @attachment
  Scenario: Attach playwright trace in After hook
    When I open the page "https://playwright.dev/"
    Then fail intentionally
