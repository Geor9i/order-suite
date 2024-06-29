import { html } from "lit-html";

export const inventoryProductsTemplate = () => html`
<table>
    <tbody>
        <tr>
            <th>Products</th>
            <th>value</th>
        </tr>
        <tr>
            <td>Cheese</td>
            <td>4.00</td>
        </tr>
    </tbody>
</table>
`