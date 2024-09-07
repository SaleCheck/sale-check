document.getElementById('crud-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const itemName = document.getElementById('item-name').value;
    if (itemName) {
        const itemList = document.getElementById('item-list');
        const listItem = document.createElement('li');
        listItem.textContent = itemName;
        itemList.appendChild(listItem);

        document.getElementById('item-name').value = '';
    }
});
