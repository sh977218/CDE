export function handleDropdown(
    dropdownMenus: HTMLElement[]
): [() => void, () => void] {
    const documentHandler = () => {
        dropdownMenus.forEach(dropdownMenu =>
            dropdownMenu.classList.remove('show')
        );
        dropdownMenus.length = 0;
    };
    document.addEventListener('click', documentHandler);
    return [
        documentHandler,
        () => {
            document.removeEventListener('click', documentHandler);
        },
    ];
}
