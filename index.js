class HintsForm {
  constructor() {
    this.query = "";
    // add token
    this.token = "512d044a8fdb1659ac2e0104d9dd5963e8c0e943";
    this.suggestionsBlock = null;
    this.suggestionsData = [];
    this.organization = null;
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
      this.addSuggestionsBlock(suggestionsData);
    } catch (error) {
      console.log(error);
    }
  }

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

  addSuggestionsBlock(data) {
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
    const { fullName, shortName, inn, kpp, address, title } = data;
    const fullNameField = document.getElementById("name_full");
    const shortNameField = document.getElementById("name_short");
    const addressField = document.getElementById("address");
    const innKppField = document.getElementById("inn_kpp");
    fullNameField.value = fullName;
    shortNameField.value = shortName;
    addressField.value = address;
    innKppField.value = `${inn} / ${kpp}`;
    this.suggestionsBlock.style.display = "none";
    this.query = title;
    this.updateQueryValue();
  }

  updateQueryValue() {
    const query = document.getElementById("party");
    query.value = this.query;
  }

  render() {
    // create container section
    const containerSection = document.createElement("section");
    containerSection.className = "container";
    const paragraph = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = "Компания или ИП";
    paragraph.appendChild(strong);
    containerSection.appendChild(paragraph);
    const partyInput = document.createElement("input");
    partyInput.id = "party";
    partyInput.name = "party";
    partyInput.type = "text";
    partyInput.placeholder =
      "Введите название, ИНН, ОГРН или адрес организации";
    containerSection.appendChild(partyInput);
    const suggestions = document.createElement("div");
    suggestions.className = "suggestions";
    const message = document.createElement("p");
    message.className = "suggestions-message";
    message.textContent = "Выберите вариант или продолжите ввод";
    suggestions.appendChild(message);
    const list = document.createElement("ul");
    list.addEventListener("click", (event) => {
      if (event.target.closest("li").className === "suggestions-item") {
        this.addOrganizationInfo(
          this.suggestionsData[+event.target.closest("li").id],
        );
      }
    });
    suggestions.appendChild(list);
    this.suggestionsBlock = suggestions;
    containerSection.appendChild(suggestions);
    // create result section
    const resultSection = document.createElement("section");
    resultSection.className = "result";
    const typeParagraph = document.createElement("p");
    typeParagraph.id = "type";
    resultSection.appendChild(typeParagraph);
    this.rowsData.forEach((item) => {
      const div = document.createElement("div");
      div.className = "row";
      const label = document.createElement("label");
      label.textContent = item.label;
      div.appendChild(label);
      const input = document.createElement("input");
      input.id = item.id;
      div.appendChild(input);
      resultSection.appendChild(div);
    });
    document.body.prepend(resultSection);
    document.body.prepend(containerSection);

    partyInput.addEventListener("input", (event) => {
      this.query = event.target.value;
      if (this.query) {
        this.fetchRelevantResults();
      } else {
        this.suggestionsBlock.style.display = "none";
      }
    });

    partyInput.addEventListener("blur", (event) => {
      setTimeout(() => {
        this.suggestionsBlock.style.display = "none";
      }, 100);
    });

    partyInput.addEventListener("focus", () => {
      if (this.query) {
        this.fetchRelevantResults();
      }
    });
  }
}

const form = new HintsForm();
form.render();
