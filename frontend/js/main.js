document.addEventListener('DOMContentLoaded', () => {
    const authToken = sessionStorage.getItem('authToken');
    if (!authToken) window.location.href = 'login.html';

    const productList = document.getElementById('productList');
    const createProductBtn = document.getElementById('createProductBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Cargar productos del usuario
    loadProducts();

    // Botón de creación de producto
    createProductBtn.addEventListener('click', () => {
        renderProductForm();
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('authToken');
        window.location.href = 'login.html';
    });

    // Cargar productos desde el backend
    async function loadProducts() {
        try {
            const response = await fetch('http://localhost:5000/api/products', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    // Renderizar productos en el DOM
    function renderProducts(products) {
        productList.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-3';
            card.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${product.nombre}</h5>
                        <p class="card-text">${product.descripcion}</p>
                        <p class="text-muted">Precio: $${product.precio}</p>
                        <button class="btn btn-warning btn-edit" data-id="${product.id}">Editar</button>
                        <button class="btn btn-danger btn-delete" data-id="${product.id}">Eliminar</button>
                    </div>
                </div>
            `;
            productList.appendChild(card);
        });

        // Delegación de eventos para botones dinámicos
        productList.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete')) {
                deleteProduct(e.target.dataset.id);
            } else if (e.target.classList.contains('btn-edit')) {
                editProduct(e.target.dataset.id);
            }
        });
    }

    // Eliminar producto
    async function deleteProduct(productId) {
        if (!confirm('¿Eliminar este producto?')) return;
        try {
            await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            loadProducts(); // Recargar lista
        } catch (error) {
            console.error('Error al eliminar:', error);
        }
    }

    // Formulario dinámico (Crear/Editar)
    function renderProductForm(product = {}) {
        const container = document.getElementById('productFormContainer');
        container.innerHTML = `
            <div class="card shadow mt-4">
                <div class="card-header bg-${product.id ? 'warning' : 'primary'} text-white">
                    <h4>${product.id ? 'Editar' : 'Crear'} Producto</h4>
                </div>
                <div class="card-body">
                    <form id="productForm">
                        <input type="hidden" id="productId" value="${product.id || ''}">
                        <div class="mb-3">
                            <label for="nombre" class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="nombre" value="${product.nombre || ''}" required>
                        </div>
                        <div class="mb-3">
                            <label for="descripcion" class="form-label">Descripción</label>
                            <textarea class="form-control" id="descripcion" required>${product.descripcion || ''}</textarea>
                        </div>
                        <div class="mb-3">
                            <label for="precio" class="form-label">Precio</label>
                            <input type="number" step="0.01" class="form-control" id="precio" value="${product.precio || ''}" required>
                        </div>
                        <button type="submit" class="btn btn-${product.id ? 'warning' : 'primary'} w-100">Guardar</button>
                    </form>
                </div>
            </div>
        `;
        container.classList.remove('d-none');
        
        // Manejar envío del formulario
        document.getElementById('productForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const productData = {
                nombre: document.getElementById('nombre').value,
                descripcion: document.getElementById('descripcion').value,
                precio: parseFloat(document.getElementById('precio').value),
                id: document.getElementById('productId').value || undefined
            };
            
            const method = product.id ? 'PUT' : 'POST';
            const url = product.id 
                ? `http://localhost:5000/api/products/${product.id}`
                : 'http://localhost:5000/api/products';

            try {
                await fetch(url, {
                    method,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(productData)
                });
                container.classList.add('d-none');
                loadProducts(); // Recargar lista
            } catch (error) {
                console.error('Error al guardar:', error);
            }
        });
    }

    // Editar producto (cargar datos en el formulario)
    async function editProduct(productId) {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const product = await response.json();
            renderProductForm(product);
        } catch (error) {
            console.error('Error al cargar producto:', error);
        }
    }
});