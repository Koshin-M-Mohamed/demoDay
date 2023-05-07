let btn = document.querySelectorAll("#delete");

Array.from(btn).forEach((element) => {
  element.addEventListener("click", () => {
    console.log(element.dataset.todo);

    fetch("deletePost", {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: element.dataset.id,
      }),
    }).then(function (response) {
      window.location.reload();
    });
  });
});
