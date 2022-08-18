export function DELETE<BoundaryOut>(
    url: string,
    object: BoundaryOut
): Promise<void> {
    return fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(object),
    }).then(() => {});
}

export function GET<BoundaryIn>(url: string): Promise<BoundaryIn> {
    return fetch(url).then(res => res.json());
}

export function POST<BoundaryOut, BoundaryIn>(
    url: string,
    object: BoundaryOut
): Promise<BoundaryIn> {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(object),
    }).then(res => res.json());
}

export function PUT<BoundaryOut, BoundaryIn>(
    url: string,
    object: BoundaryOut
): Promise<BoundaryIn> {
    return fetch(url, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(object),
    }).then(res => res.json());
}
