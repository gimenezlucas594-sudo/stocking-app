const { useState, useEffect } = React;

const API_URL = "https://stocking-app.onrender.com/api";

// ============ Login ============
function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Error de login');
            }

            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onLoginSuccess(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-indigo-600 mb-2">StocKing</h1>
                    <p className="text-gray-600">Sistema de Gestión</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="lucas"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Ingresando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ============ Dashboard Jefe con Productos y Ventas ============
function DashboardJefe({ user, onLogout }) {
    const [vista, setVista] = useState('productos');
    const [productos, setProductos] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', codigo_barras: '', precio: '', stock: '', categoria: '', tipo_venta: 'unidad' });

    useEffect(() => {
        cargarProductos();
        if (vista === 'ventas') cargarVentas();
    }, [vista]);

    const cargarProductos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/productos/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProductos(data);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const cargarVentas = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/ventas/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setVentas(data);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        try {
            const url = editando 
                ? `${API_URL}/productos/${editando.id}`
                : `${API_URL}/productos/`;
            
            const response = await fetch(url, {
                method: editando ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    codigo_barras: formData.codigo_barras || null,
                    precio: parseFloat(formData.precio),
                    stock: parseFloat(formData.stock),
                    categoria: formData.categoria || null,
                    tipo_venta: formData.tipo_venta
                })
            });

            if (response.ok) {
                await cargarProductos();
                setShowModal(false);
                setFormData({ nombre: '', codigo_barras: '', precio: '', stock: '', categoria: '', tipo_venta: 'unidad' });
                setEditando(null);
            }
        } catch (err) {
            alert('Error al guardar producto');
        }
    };

    const eliminarProducto = async (id) => {
        if (!confirm('¿Eliminar este producto?')) return;
        
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/productos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                await cargarProductos();
            }
        } catch (err) {
            alert('Error al eliminar producto');
        }
    };

    const abrirEditar = (producto) => {
        setEditando(producto);
        setFormData({
            nombre: producto.nombre,
            codigo_barras: producto.codigo_barras || '',
            precio: producto.precio.toString(),
            stock: producto.stock.toString(),
            categoria: producto.categoria || '',
            tipo_venta: producto.tipo_venta
        });
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-6">
                            <h1 className="text-2xl font-bold text-indigo-600">StocKing</h1>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setVista('productos')}
                                    className={`px-4 py-2 rounded-lg transition ${vista === 'productos' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Productos
                                </button>
                                <button 
                                    onClick={() => setVista('ventas')}
                                    className={`px-4 py-2 rounded-lg transition ${vista === 'ventas' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Ventas
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700">{user.full_name || user.username}</span>
                            <button onClick={onLogout} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {vista === 'productos' ? (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">Productos</h2>
                            <button 
                                onClick={() => { setShowModal(true); setEditando(null); setFormData({ nombre: '', codigo_barras: '', precio: '', stock: '', categoria: '', tipo_venta: 'unidad' }); }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                + Nuevo Producto
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {productos.map(producto => (
                                        <tr key={producto.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.codigo_barras || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{producto.nombre}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {producto.tipo_venta === 'peso' ? '⚖️ Peso' : '📦 Unidad'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${producto.precio}{producto.tipo_venta === 'peso' ? '/kg' : ''}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {producto.stock}{producto.tipo_venta === 'peso' ? 'g' : ''}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                <button onClick={() => abrirEditar(producto)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => eliminarProducto(producto.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {productos.length === 0 && (
                                <div className="text-center py-12 text-gray-500">No hay productos cargados</div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Historial de Ventas</h2>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {ventas.map(venta => (
                                        <tr key={venta.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(venta.created_at).toLocaleString('es-AR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                                ${venta.total.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {venta.items.length} productos
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {ventas.length === 0 && (
                                <div className="text-center py-12 text-gray-500">No hay ventas registradas</div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">{editando ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                                <input
                                    type="text"
                                    value={formData.codigo_barras}
                                    onChange={(e) => setFormData({...formData, codigo_barras: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Escanear o ingresar manualmente"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Venta *</label>
                                <select
                                    value={formData.tipo_venta}
                                    onChange={(e) => setFormData({...formData, tipo_venta: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    required
                                >
                                    <option value="unidad">Por Unidad</option>
                                    <option value="peso">Por Peso (kg)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Precio * {formData.tipo_venta === 'peso' && '(por kg)'}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.precio}
                                    onChange={(e) => setFormData({...formData, precio: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Stock * {formData.tipo_venta === 'peso' && '(en gramos)'}
                                </label>
                                <input
                                    type="number"
                                    step={formData.tipo_venta === 'peso' ? '1' : '1'}
                                    value={formData.stock}
                                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <input
                                    type="text"
                                    value={formData.categoria}
                                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                                    Guardar
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============ Dashboard Empleado con Sistema de Ventas ============
function DashboardEmpleado({ user, onLogout }) {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(false);
    const [mostrarPago, setMostrarPago] = useState(false);
    const [medioPago, setMedioPago] = useState('efectivo');
    const [montoEfectivo, setMontoEfectivo] = useState(0);
    const [montoTarjeta, setMontoTarjeta] = useState(0);
    const [montoMercadopago, setMontoMercadopago] = useState(0);

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/productos/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProductos(data);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const buscarProducto = (termino) => {
        setBusqueda(termino);
        if (termino.length > 0) {
            const encontrado = productos.find(p => 
                p.codigo_barras === termino || 
                p.nombre.toLowerCase().includes(termino.toLowerCase())
            );
            if (encontrado) {
                agregarAlCarrito(encontrado);
                setBusqueda('');
            }
        }
    };

    const agregarAlCarrito = (producto) => {
        const existe = carrito.find(item => item.producto.id === producto.id);
        if (existe) {
            setCarrito(carrito.map(item => 
                item.producto.id === producto.id 
                    ? {...item, cantidad: item.cantidad + (producto.tipo_venta === 'peso' ? 100 : 1)}
                    : item
            ));
        } else {
            setCarrito([...carrito, { producto, cantidad: producto.tipo_venta === 'peso' ? 100 : 1 }]);
        }
    };

    const actualizarCantidad = (productoId, nuevaCantidad) => {
        if (nuevaCantidad <= 0) {
            setCarrito(carrito.filter(item => item.producto.id !== productoId));
        } else {
            setCarrito(carrito.map(item => 
                item.producto.id === productoId 
                    ? {...item, cantidad: parseFloat(nuevaCantidad)}
                    : item
            ));
        }
    };

    const calcularTotal = () => {
        return carrito.reduce((total, item) => {
            const cantidad = item.producto.tipo_venta === 'peso' ? item.cantidad / 1000 : item.cantidad;
            return total + (item.producto.precio * cantidad);
        }, 0);
    };

const abrirPago = () => {
        if (carrito.length === 0) {
            alert('El carrito está vacío');
            return;
        }
        const total = calcularTotal();
        setMontoEfectivo(total);
        setMontoTarjeta(0);
        setMontoMercadopago(0);
        setMedioPago('efectivo');
        setMostrarPago(true);
    };

    const realizarVenta = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const items = carrito.map(item => ({
                producto_id: item.producto.id,
                cantidad: item.producto.tipo_venta === 'peso' ? item.cantidad : item.cantidad
            }));

            const response = await fetch(`${API_URL}/ventas/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    items,
                    medio_pago: medioPago,
                    monto_efectivo: montoEfectivo,
                    monto_tarjeta: montoTarjeta,
                    monto_mercadopago: montoMercadopago
                })
            });

            if (response.ok) {
                alert('✅ Venta registrada correctamente');
                setCarrito([]);
                setMostrarPago(false);
                await cargarProductos();
            } else {
                const error = await response.json();
                alert('❌ Error: ' + error.detail);
            }
        } catch (err) {
            alert('❌ Error al procesar la venta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-indigo-600">StocKing - Ventas</h1>
                            <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {user.local_nombre || 'Sin local'}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700">{user.full_name || user.username}</span>
                            <button onClick={onLogout} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Panel de productos */}
                    <div className="lg:col-span-2">
                        <div className="mb-4">
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => buscarProducto(e.target.value)}
                                placeholder="🔍 Buscar por nombre o escanear código de barras..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {productos.filter(p => p.stock > 0).map(producto => (
                                <button
                                    key={producto.id}
                                    onClick={() => agregarAlCarrito(producto)}
                                    className="bg-white rounded-xl shadow-sm p-4 border-2 border-gray-200 hover:border-indigo-500 transition text-left"
                                >
                                    <h3 className="font-bold text-gray-900">{producto.nombre}</h3>
                                    <p className="text-2xl font-bold text-indigo-600 mt-2">
                                        ${producto.precio}{producto.tipo_venta === 'peso' && '/kg'}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Stock: {producto.stock}{producto.tipo_venta === 'peso' ? 'g' : ''}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Carrito */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                            <h2 className="text-xl font-bold mb-4">Carrito</h2>
                            
                            {carrito.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Carrito vacío</p>
                            ) : (
                                <>
                                    <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                                        {carrito.map(item => (
                                            <div key={item.producto.id} className="border-b pb-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-medium text-sm">{item.producto.nombre}</span>
                                                    <button 
                                                        onClick={() => actualizarCantidad(item.producto.id, 0)}
                                                        className="text-red-500 text-sm"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={item.cantidad}
                                                        onChange={(e) => actualizarCantidad(item.producto.id, e.target.value)}
                                                        className="w-20 px-2 py-1 border rounded text-sm"
                                                        step={item.producto.tipo_venta === 'peso' ? '10' : '1'}
                                                    />
                                                    <span className="text-sm text-gray-600">
                                                        {item.producto.tipo_venta === 'peso' ? 'g' : 'un'}
                                                    </span>
                                                    <span className="ml-auto font-bold text-sm">
                                                        ${(item.producto.precio * (item.producto.tipo_venta === 'peso' ? item.cantidad / 1000 : item.cantidad)).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xl font-bold">TOTAL:</span>
                                            <span className="text-3xl font-bold text-green-600">
                                                ${calcularTotal().toFixed(2)}
                                            </span>
                                        </div>

                                        <button
                                            onClick={abrirPago}
                                            disabled={loading}
                                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                                        >
                                            {loading ? 'Procesando...' : '💰 Cobrar'}
                                        </button>

                                        <button
                                            onClick={() => setCarrito([])}
                                            className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                                        >
                                            Limpiar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal de Medios de Pago */}
            {mostrarPago && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-4">Método de Pago</h3>
                        
                        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                            <p className="text-sm text-gray-600">Total a cobrar:</p>
                            <p className="text-3xl font-bold text-green-600">${calcularTotal().toFixed(2)}</p>
                        </div>

                        <div className="space-y-3 mb-6">
                            <button
                                onClick={() => {
                                    setMedioPago('efectivo');
                                    setMontoEfectivo(calcularTotal());
                                    setMontoTarjeta(0);
                                    setMontoMercadopago(0);
                                }}
                                className={`w-full p-4 rounded-lg border-2 transition ${
                                    medioPago === 'efectivo' 
                                        ? 'border-green-500 bg-green-50' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">💵 Efectivo</span>
                                    {medioPago === 'efectivo' && <span className="text-green-600">✓</span>}
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    setMedioPago('tarjeta');
                                    setMontoEfectivo(0);
                                    setMontoTarjeta(calcularTotal());
                                    setMontoMercadopago(0);
                                }}
                                className={`w-full p-4 rounded-lg border-2 transition ${
                                    medioPago === 'tarjeta' 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">💳 Tarjeta</span>
                                    {medioPago === 'tarjeta' && <span className="text-blue-600">✓</span>}
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    setMedioPago('mercadopago');
                                    setMontoEfectivo(0);
                                    setMontoTarjeta(0);
                                    setMontoMercadopago(calcularTotal());
                                }}
                                className={`w-full p-4 rounded-lg border-2 transition ${
                                    medioPago === 'mercadopago' 
                                        ? 'border-cyan-500 bg-cyan-50' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">🟦 Mercado Pago</span>
                                    {medioPago === 'mercadopago' && <span className="text-cyan-600">✓</span>}
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    setMedioPago('mixto');
                                    const total = calcularTotal();
                                    setMontoEfectivo(total / 2);
                                    setMontoTarjeta(total / 2);
                                    setMontoMercadopago(0);
                                }}
                                className={`w-full p-4 rounded-lg border-2 transition ${
                                    medioPago === 'mixto' 
                                        ? 'border-purple-500 bg-purple-50' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">🔀 Pago Mixto</span>
                                    {medioPago === 'mixto' && <span className="text-purple-600">✓</span>}
                                </div>
                            </button>
                        </div>

                        {medioPago === 'mixto' && (
                            <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium mb-1">💵 Efectivo:</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={montoEfectivo}
                                        onChange={(e) => setMontoEfectivo(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">💳 Tarjeta:</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={montoTarjeta}
                                        onChange={(e) => setMontoTarjeta(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">🟦 Mercado Pago:</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={montoMercadopago}
                                        onChange={(e) => setMontoMercadopago(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div className="pt-2 border-t">
                                    <div className="flex justify-between text-sm">
                                        <span>Suma parcial:</span>
                                        <span className={
                                            (montoEfectivo + montoTarjeta + montoMercadopago).toFixed(2) === calcularTotal().toFixed(2)
                                                ? 'text-green-600 font-bold'
                                                : 'text-red-600 font-bold'
                                        }>
                                            ${(montoEfectivo + montoTarjeta + montoMercadopago).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={realizarVenta}
                                disabled={loading || (medioPago === 'mixto' && (montoEfectivo + montoTarjeta + montoMercadopago).toFixed(2) !== calcularTotal().toFixed(2))}
                                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Procesando...' : 'Confirmar Pago'}
                            </button>
                            <button
                                onClick={() => setMostrarPago(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============ App Principal ============
function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    if (user.role === 'jefe_papa' || user.role === 'jefe_mama') {
        return <DashboardJefe user={user} onLogout={handleLogout} />;
    }

    return <DashboardEmpleado user={user} onLogout={handleLogout} />;
}

ReactDOM.render(<App />, document.getElementById('root'));
