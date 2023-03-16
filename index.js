class HintsForm extends HTMLElement {
  constructor() {
    super();
    this.token = "512d044a8fdb1659ac2e0104d9dd5963e8c0e943"; // replace with your token
    this.query = "";
    this.hintsForm = null;
    this.suggestionsBlock = null;
    this.suggestionsData = [];
    this.suggestionsMessage = null;
    this.organization = null;
    this.rendered = false;
    this.rowsData = [
      {
        label: "Краткое наименование",
        id: "name_short",
      },
      {
        label: "Полное наименование",
        id: "name_full",
      },
      {
        label: "ИНН / КПП",
        id: "inn_kpp",
      },
      {
        label: "Адрес",
        id: "address",
      },
    ];
  }

  async fetchRelevantResults() {
    try {
      const url =
        "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Token " + this.token,
        },
        body: JSON.stringify({ query: this.query, count: 5 }),
      });
      const result = await response.json();
      const suggestionsData = this.dataAdapter(result.suggestions);
      this.addSuggestionsList(suggestionsData);
    } catch (error) {
      console.log(error); // add your error handling
    }
  }

  // get necessary data from response
  dataAdapter(data) {
    const adaptedData = [];
    data.forEach((item) => {
      const adaptedItem = {
        title: item.value,
        inn: item.data.inn,
        kpp: item.data.kpp,
        fullName: item.data.name.full,
        shortName: item.data.name.short,
        address: item.data.address.value,
      };
      adaptedData.push(adaptedItem);
    });
    return adaptedData;
  }

  addSuggestionsList(data) {
    if (!data.length) {
      this.suggestionsMessage.textContent = "Неизвестная организация";
    } else {
      this.suggestionsMessage.textContent =
        "Выберите вариант или продолжите ввод";
    }
    const suggestions = this.suggestionsBlock;
    const list = suggestions.lastChild;
    list.innerHTML = "";
    data.forEach((item, index) => {
      const listItem = document.createElement("li");
      listItem.className = "suggestions-item";
      const paragraph = document.createElement("p");
      paragraph.className = "suggestions-title";
      paragraph.textContent = item.title;
      listItem.appendChild(paragraph);
      const info = document.createElement("p");
      info.textContent = `${item.inn} ${item.address}`;
      listItem.appendChild(info);
      listItem.id = index;
      list.appendChild(listItem);
    });
    suggestions.appendChild(list);
    suggestions.style.display = "block";
    this.suggestionsData = data;
  }

  addOrganizationInfo(data) {
    const hintsForm = this.hintsForm;
    const { fullName, shortName, inn, kpp, address, title } = data;
    const fullNameField = hintsForm.querySelector("#name_full");
    const shortNameField = hintsForm.querySelector("#name_short");
    const addressField = hintsForm.querySelector("#address");
    const innKppField = hintsForm.querySelector("#inn_kpp");
    fullNameField.value = fullName;
    shortNameField.value = shortName;
    addressField.value = address;
    innKppField.value = `${inn} / ${kpp}`;
    this.suggestionsBlock.style.display = "none";
    this.query = title;
    this.updateQueryValue();
  }

  updateQueryValue() {
    const hintsForm = this.hintsForm;
    const query = hintsForm.querySelector("#party");
    query.value = this.query;
  }

  render() {
    // create hints-form
    const hintsForm = document.createElement("div");
    hintsForm.className = "hints-form";
    // create container
    const container = document.createElement("div");
    container.className = "container";
    const paragraph = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = "Компания или ИП";
    paragraph.appendChild(strong);
    container.appendChild(paragraph);
    const partyInput = document.createElement("input");
    partyInput.id = "party";
    partyInput.name = "party";
    partyInput.type = "text";
    partyInput.placeholder =
      "Введите название, ИНН, ОГРН или адрес организации";
    container.appendChild(partyInput);
    const suggestions = document.createElement("div");
    suggestions.className = "suggestions";
    const message = document.createElement("p");
    message.className = "suggestions-message";
    message.textContent = "Выберите вариант или продолжите ввод";
    this.suggestionsMessage = message;
    suggestions.appendChild(message);
    const list = document.createElement("ul");
    suggestions.appendChild(list);
    this.suggestionsBlock = suggestions;
    container.appendChild(suggestions);
    // create result
    const result = document.createElement("div");
    result.className = "result";
    const typeParagraph = document.createElement("p");
    typeParagraph.id = "type";
    result.appendChild(typeParagraph);
    this.rowsData.forEach((item) => {
      const div = document.createElement("div");
      div.className = "row";
      const label = document.createElement("label");
      label.textContent = item.label;
      div.appendChild(label);
      const input = document.createElement("input");
      input.id = item.id;
      div.appendChild(input);
      result.appendChild(div);
    });
    this.hintsForm = hintsForm;
    hintsForm.appendChild(container);
    hintsForm.appendChild(result);

    // add event Listeners
    list.addEventListener("mousedown", (event) => {
      if (event.target.closest("li").className === "suggestions-item") {
        this.addOrganizationInfo(
          this.suggestionsData[+event.target.closest("li").id],
        );
      }
    });

    partyInput.addEventListener("input", (event) => {
      this.query = event.target.value;
      if (this.query) {
        this.fetchRelevantResults();
      } else {
        this.suggestionsBlock.style.display = "none";
      }
    });

    partyInput.addEventListener("blur", () => {
      this.suggestionsBlock.style.display = "none";
    });

    partyInput.addEventListener("focus", () => {
      if (this.query) {
        this.fetchRelevantResults();
      }
    });

    // activate shadow DOM and add hints form to shadow
    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");

    style.textContent = `
    ul,
    li {
      margin: 0;
      padding: 0;
    }
    
    input {
      font-size: 16px;
      padding: 4px;
    }

    .hints-form {
      max-width: 800px;
      position: relative;
    }
    
    .result {
      width: 50%;
      min-width: 300px;
      margin-top: 1rem;
    }
    
    .row {
      margin-bottom: 1rem;
    }
    
    .row label {
      display: block;
      min-width: 10em;
    }
    
    .row input,
    .row textarea,
    .container input {
      width: 100%;
      box-sizing: border-box;
    }
    
    .suggestions {
      position: absolute;
      width: 100%;
      background-color: #fff;
      z-index: 5;
      display: none;
      border: 1px solid gray;
      border-radius: 3px;
      box-sizing: border-box;
    }
    
    .suggestions li {
      padding: 5px 5px;
      cursor: pointer;
    }
    
    .suggestions li:hover {
      background-color: #eee;
    }
    
    .suggestions ul {
      list-style: none;
    }

    .suggestions-message {
      font-size: 14px;
      padding: 5px 5px;
    }

    .suggestions p {
      margin: 0;
    }

    @media screen and (max-width: 360px) {

      input {
        font-size: 14px;
      }

      .container input {
        max-width: 300px;
      }

      .result {
        min-width: unset;
        width: 100%;
      }

    }
    `;

    shadow.appendChild(style);
    shadow.appendChild(hintsForm);
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }
}

customElements.define("hints-form", HintsForm);
