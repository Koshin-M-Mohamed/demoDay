document.querySelector("#btn").addEventListener("click", addItem);

function addItem() {
let searchTerm = document.querySelector("#toDo").value;


  fetch("addItem", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      todo: searchTerm,
    }),
  }).then(window.location.reload(true));
}

let btn = document.querySelectorAll("#delete");

Array.from(btn).forEach((element) => {
  element.addEventListener("click", () => {
    console.log(element.dataset.todo);

    fetch("deleteItem", {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        todo: element.dataset.todo  }),
    }).then(window.location.reload(true));
  });
});
