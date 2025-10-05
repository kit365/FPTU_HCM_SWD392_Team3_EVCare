import slugify from "slugify";

export const matchesSearch = (item: any, keyword: string | null) => {
    if (!keyword) return true;
    const keywordRegex = new RegExp(keyword, "i");
    return !!(item.name && keywordRegex.test(slugify(item.name, { replacement: " ", lower: true })));
}

export const matchesStatus = (item: any, statusFilter: string) => {
    if (!statusFilter) return true;
    return item.status === statusFilter;
}

export const compareBySort = (a: any, b: any, sort: { key: string; value: "asc" | "desc" }): number => {
    if (!sort.key) return 0;

    const A = a[sort.key];
    const B = b[sort.key];

    const numA = Number(A);
    const numB = Number(B);
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
        return sort.value === "asc" ? numA - numB : numB - numA;
    }

    const timeA = Date.parse(String(A));
    const timeB = Date.parse(String(B));
    if (!Number.isNaN(timeA) && !Number.isNaN(timeB)) {
        return sort.value === "asc" ? timeA - timeB : timeB - timeA;
    }

    return sort.value === "asc"
        ? String(A).localeCompare(String(B), "vi", { sensitivity: "base", numeric: true })
        : String(B).localeCompare(String(A), "vi", { sensitivity: "base", numeric: true });
}