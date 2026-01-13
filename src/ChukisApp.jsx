import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { ProductTable } from "./components/products/ProductTable";
import { ProductForm } from "./components/products/ProductForm";
import { create, findAll, remove, update } from "./services/productService";
import { UserTable } from "./components/users/UserTable";
import { UserForm } from "./components/users/UserForm";
import { createUser, findAllUsers, removeUser, updateUser } from "./services/userService";
import Swal from "sweetalert2";

export const ChukisApp = ({ title = "title default", user, onLogout }) => {

  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])

  const [productSelected, setProductSelected] = useState({
    id: 0,
    name: '',
    description: '',
    price: '',
    color: '',
    stock: ''
  })

  const [userSelected, setUserSelected] = useState({
    id: 0,
    username: '',
    role: '',
    password: '',
    image_url: '',
  })

  const getProducts = async () => {
    const result = await findAll()
    setProducts(result.data)

  }

  const getUsers = async () => {
    const result = await findAllUsers()
    setUsers(result.data)

  }

  useEffect(() => {
    getProducts()
    getUsers()
    console.log('cargando la página...')
  }, [])

  const handlerAddProcuct = async (product) => {
    if (product.id > 0) {
      const response = await update(product)
      setProducts(
        products.map(prod => {
          if (prod.id == product.id) {
            return { ...response.data };
          }
          return prod
        })
      )
      Swal.fire({
        title: "actualizado con éxito",
        text: `producto ${product.name} actualizado con éxito`,
        icon: "success"
      });
    } else {
      const response = await create(product);
      setProducts([...products, { ...response.data }]);
      Swal.fire({
        title: "Creado con éxito",
        text: `Producto ${product.name} creado con éxito`,
        icon: "success"
      });
    }
  }

  const handlerAddUser = async (user) => {
    if (user.id > 0) {
      const response = await updateUser(user)
      setUsers(
        users.map(u => {
          if (u.id == user.id) {
            return { ...response.data };
          }
          return u
        })
      )
      Swal.fire({
        title: "actualizado con éxito",
        text: `Usuario ${user.username} actualizado con éxito`,
        icon: "success"
      });
    } else {
      const response = await createUser(user);
      setUsers([...users, { ...response.data }]);
      Swal.fire({
        title: "Creado con éxito",
        text: `Usuario ${user.username} creado con éxito`,
        icon: "success"
      });
    }
  }

  const handlerProductSelected = (product) => {
    setProductSelected({ ...product })
    console.log(productSelected)
  }

  const handlerUserSelected = (user) => {
    setUserSelected({ ...user })
    console.log(userSelected)
  }

  const handlerRemoveProduct = (id) => {

    Swal.fire({
      title: "¿Está seguro de eliminar el producto?",
      text: "Esta acción no se puede revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "¡Continuar!",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        remove(id)
        setProducts(
          products.filter(product => product.id != id)
        )
        Swal.fire({
          title: "¡Eliminado!",
          text: "El producto ha sido eliminado con éxito",
          icon: "success"
        });
      }
    });

  }

  const handlerRemoveUser = (id) => {

    Swal.fire({
      title: "¿Está seguro de eliminar el usuario?",
      text: "Esta acción no se puede revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "¡Continuar!",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        removeUser(id)
        setUsers(
          users.filter(user => user.id != id)
        )
        Swal.fire({
          title: "¡Eliminado!",
          text: "El usuario ha sido eliminado con éxito",
          icon: "success"
        });
      }
    });

  }

  return (

    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>ChukisApp</h2>
        <div>
          <span className="me-3">
            👤 {user.username} ({user.role})
          </span>
          <button className="btn btn-outline-danger btn-sm" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <h2>{title}</h2>
      <h2>Productos</h2>
      <div className="row">
        <div className="col">
          <ProductForm handlerAdd={handlerAddProcuct} productSelected={productSelected} />
        </div>
        <div className="col">
          {
            (products.length > 0) ?
              <ProductTable products={products}
                handlerProductSelected={handlerProductSelected}
                handlerRemoveProduct={handlerRemoveProduct} />
              : <div className="alert alert-warning">
                No hay productos en el sistema
              </div>
          }

        </div>
      </div>
      <h2>Usuarios</h2>
      <div className="row">
        <div className="col">
          <UserForm handlerAdd={handlerAddUser} userSelected={userSelected} />
        </div>
        <div className="col">
          {
            (users.length > 0) ?
              <UserTable users={users}
                handlerUserSelected={handlerUserSelected}
                handlerRemoveUser={handlerRemoveUser} />
              : <div className="alert alert-warning">
                No hay usuarios en el sistema
              </div>
          }

        </div>
      </div>
    </div>
  );
};

ChukisApp.propTypes = {
  title: PropTypes.string.isRequired,
};
