import React from "react";
import { Link, NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <ul
      className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion"
      id="accordionSidebar"
    >
      <a
        className="sidebar-brand d-flex align-items-center justify-content-center"
        href="/"
      >
        {/* <div className="sidebar-brand-icon rotate-n-15">
          <i className="fas fa-laugh-wink" />
        </div>
        <div className="sidebar-brand-text mx-3">My Shop</div> */}
        <div className="sidebar-brand-icon rotate-n-15">
          <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </div>
        <div className="sidebar-brand-text mx-3">ADMIN</div>
      </a>
      <hr className="sidebar-divider my-0" />
      <li className="nav-item active">
        <Link to="/" className="nav-link" href="index.html">
          <i className="fas fa-fw fa-tachometer-alt" />
          <span>Dashboard</span>
        </Link>
      </li>
      <hr className="sidebar-divider" />
      <div className="sidebar-heading">Management</div>
      <li className="nav-item">
        <a
          className="nav-link collapsed"
          href="#"
          data-toggle="collapse"
          data-target="#collapseTwo"
          aria-expanded="true"
          aria-controls="collapseTwo"
        >
          <i className="fas fa-fw fa-cog" />
          <span>Bán hàng</span>
        </a>
        <div
          id="collapseTwo"
          className="collapse"
          aria-labelledby="headingTwo"
          data-parent="#accordionSidebar"
        >
          <div className="bg-white py-2 collapse-inner rounded">
            <NavLink to="order" className="collapse-item">
              Danh sách đơn hàng
            </NavLink>
            <NavLink to="discount" className="collapse-item">
              Khuyến mãi
            </NavLink>
            <NavLink to="./product" className="collapse-item">
              Sản phẩm
            </NavLink>
          </div>
        </div>
      </li>
      <li className="nav-item">
        <a
          className="nav-link collapsed"
          href="#"
          data-toggle="collapse"
          data-target="#collapseUtilities"
          aria-expanded="true"
          aria-controls="collapseUtilities"
        >
          <i className="fas fa-fw fa-wrench" />
          <span>Quản lý</span>
        </a>
        <div
          id="collapseUtilities"
          className="collapse"
          aria-labelledby="headingUtilities"
          data-parent="#accordionSidebar"
        >
          <div className="bg-white py-2 collapse-inner rounded">
            <NavLink to="./user" className="collapse-item">
              Người dùng
            </NavLink>
            <NavLink to="./category" className="collapse-item">
              Danh mục sản phẩm
            </NavLink>
            <NavLink to="./color" className="collapse-item">
              Màu sắc
            </NavLink>
            <NavLink to="./size" className="collapse-item">
              Kích cỡ
            </NavLink>
            <NavLink className="collapse-item" to="./blog">
              Blog
            </NavLink>
            <NavLink className="collapse-item" to="./brand">
              Thương hiệu
            </NavLink>
          </div>
        </div>
      </li>
      <hr className="sidebar-divider" />
      <div className="sidebar-heading">Report</div>
      <li className="nav-item">
        <a
          className="nav-link collapsed"
          href="#"
          data-toggle="collapse"
          data-target="#collapsePages"
          aria-expanded="true"
          aria-controls="collapsePages"
        >
          <i className="fas fa-fw fa-chart-area" />
          <span>Báo cáo</span>
        </a>
        <div
          id="collapsePages"
          className="collapse"
          aria-labelledby="headingPages"
          data-parent="#accordionSidebar"
        >

          <div className="bg-white py-2 collapse-inner rounded">
            <NavLink to="./report/overview" className="collapse-item">
              Tổng quan báo cáo
            </NavLink>
            <h6 className="collapse-header">Doanh thu</h6>
            <NavLink to="./product-revenue" className="collapse-item">
              Theo sản phẩm
            </NavLink>
            <NavLink to="./customer-revenue" className="collapse-item">
              Theo khách hàng
            </NavLink>
            <NavLink to="./discount-revenue" className="collapse-item">
              Theo mã khuyến mãi
            </NavLink>
          </div>
        </div>
      </li>
    </ul>
  );
};

export default Sidebar;
