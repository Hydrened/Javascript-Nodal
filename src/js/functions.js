function removeChildren(parent) {
    [...parent.children].reverse().forEach((child) => child.remove());
}
