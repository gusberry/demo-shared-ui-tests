const BASE_URL = Cypress.env("STATIC_SERVER_URL");

if (!BASE_URL) {
  throw new Error("You had to specify STATIC_SERVER_URL before running tests");
}

describe("Shared UI Testing", () => {
  describe("Init page", () => {
    beforeEach(() => {
      cy.visit(BASE_URL);
    });

    it("should be loadable", () => {
      cy.title().should("include", "Demo App");
    });

    context("Header", () => {
      it("should have logo", () => {
        cy.get(".navbar-brand.mr-auto").should("have.text", "Test UI");
      });

      it("should navigate to / when logo clicked", () => {
        cy.get(".navbar-brand.mr-auto").click();

        cy.url().should("eq", BASE_URL);
      });
    });

    context("User list", () => {
      it("should be rendered with proper items", () => {
        cy
          .get(".col-md-3.mb-3.mb-md-0 .list-group")
          .children("div.list-group-item")
          .contains("Users");

        cy
          .get(".col-md-3.mb-3.mb-md-0 .list-group")
          .children()
          .should("have.length", 11);
      });

      it("should highlight selected user on click", () => {
        cy
          .get(".col-md-3.mb-3.mb-md-0 a:first")
          .click()
          .should("have.class", "active");
      });
    });

    context("Post list", () => {
      it("should not be visible by default", () => {
        cy.get(".tab-pane.fade").should("not.be.visible");
      });

      it("should have correct number of posts", () => {
        cy
          .get(".tab-pane.fade:first")
          .children()
          .should("have.length", 10);
      });

      it("should reveal users post list on click", () => {
        cy.get(".col-md-3.mb-3.mb-md-0 a:first").click();

        cy.get(".tab-pane.fade:first").should("be.visible");
      });

      it("should navigate to post url on item click", () => {
        cy.get(".col-md-3.mb-3.mb-md-0 a:first").click();
        cy.get(".tab-pane.fade a:first").click();

        cy.url().should("eq", `${BASE_URL}/posts/1`);
      });
    });
  });

  describe("Post page", () => {
    const post = {
      title:
        "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
      subtitle: "Leanne Graham",
      body:
        "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
    };
    beforeEach(() => {
      cy.visit(`${BASE_URL}/posts/1`);
    });

    context("Post editor", () => {
      it("should be on a page", () => {
        cy.get(".card");
      });

      it("should render a proper post info", () => {
        cy.get(".card .card-title").contains(post.title);

        cy.get(".card-subtitle").contains(post.subtitle);
        cy.get(".card-body > p").contains(post.body);
      });

      context("Edit mode", () => {
        it("should be disabled by default", () => {
          cy.get(".card-body > p").should("not.have.attr", "contenteditable");
        });

        it("should be enabled when edit button is clicked", () => {
          cy.get("button.btn-sm").click();

          cy.get(".card-body > p").focused();
          cy
            .get(".card-body > p")
            .should("have.attr", "contenteditable", "true");
        });

        it("should hide delete button and show save button when enabled", () => {
          cy.get(".card a").should("be.visible");
          cy
            .get(".card .btn.btn-outline-light")
            .eq(2)
            .should("not.be.visible");

          cy.get("button.btn-sm").click();

          cy.get(".card a").should("not.be.visible");
          cy
            .get(".card .btn.btn-outline-light")
            .eq(2)
            .should("be.visible");
        });

        it("should enable text typing on post text", () => {
          const TEST_TEXT = "TEST_TEXT_!";
          cy.get("button.btn-sm").click();
          cy.get(".card-body > p").type(TEST_TEXT);
        });

        it("should rollback post text when edit button is clicked in edit mode", () => {
          const TEST_TEXT = "TEST_TEXT_!";
          cy.get("button.btn-sm").click();
          cy.get(".card-body > p").type(TEST_TEXT);
          cy.get("button.btn-sm").click();
          cy.get(".card-body > p").contains(post.body);
        });

        it("should update post text when save button is clicked in edit mode", () => {
          const TEST_TEXT = "TEST_TEXT_!";
          cy.get("button.btn-sm").click();
          cy.get(".card-body > p").type(TEST_TEXT);
          cy
            .get(".card .btn.btn-outline-light")
            .eq(2)
            .click();
          cy.get(".card-body > p").contains(post.body + TEST_TEXT);
        });

        it("should disable edit mode when edit button is clicked in edit mode", () => {
          cy.get("button.btn-sm").click();
          cy.get("button.btn-sm").click();
          cy
            .get(".card-body > p")
            .should("have.attr", "contenteditable", "false");
        });

        it("should disable edit mode when save button is clicked in edit mode", () => {
          cy.get("button.btn-sm").click();
          cy
            .get(".card .btn.btn-outline-light")
            .eq(2)
            .click();
          cy
            .get(".card-body > p")
            .should("have.attr", "contenteditable", "false");
        });
      });
      context("Delete", () => {
        it("should navigate to init route when delete button clicked", () => {
          cy.get(".card a").click();

          cy.url().should("eq", `${BASE_URL}/`);
        });

        it("should remove post lfrom post list", () => {
          cy.get(".card a").click();

          cy.get(".col-md-3.mb-3.mb-md-0 a:first").click();

          cy
            .get(".tab-pane.fade:first")
            .children()
            .should("have.length", 9);
        });
      });
    });
    context("Comment Box", () => {
      it("should have input for comments", () => {
        cy.get("input");
      });

      it("should have comments list", () => {
        cy.get(".comment").should("have.length", 5);
      });

      it("should display a proper comment data", () => {
        cy
          .get(".comment")
          .eq(0)
          .find(".text-dark")
          .contains("id labore ex et quam laborum");
        cy
          .get(".comment")
          .eq(0)
          .find(".text-muted")
          .contains("- Eliseo@gardner.biz");
      });

      it("should be able to add comment", () => {
        const TEST_COMMENT_TEXT = "TEST_COMMENT_TEXT_!";
        cy.get("input").type(TEST_COMMENT_TEXT);

        cy.get(".input-group button").click();

        cy.get(".comment").should("have.length", 6);

        cy
          .get(".comment")
          .eq(0)
          .find(".text-dark")
          .contains(TEST_COMMENT_TEXT);
        cy
          .get(".comment")
          .eq(0)
          .find(".text-muted")
          .contains("- Sincere@april.biz");
      });
    });
  });
});
