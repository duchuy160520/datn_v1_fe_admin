import React, { useState } from "react";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import AxiosApi from "../../api/AxiosApi";
import WsUrl from "../../utils/constants/WsUrl";
import { format } from 'date-fns'
import DateUtils from "../../utils/common/DateUtils";
import WSDateFormat from "../../utils/constants/WSDateFormat";
import { useForm } from "react-hook-form";
import ToastUtils from "../../utils/ToastUtils";
import WsToastType from "../../utils/constants/WsToastType";
import WsMessage from "../../utils/constants/WsMessage";
import HashSpinner from "../../component/spinner/HashSpinner";
import { useNavigate } from 'react-router-dom'

const initReq = {
    textSearch: "",
    active: "",
    pageReq: {
        page: 0,
        pageSize: 10,
        sortField: "",
        sortDirection: ""
    }
}

let initPageInfo = {
    page: null,
    pageSize: null,
    totalElements: null,
    totalPages: null,
};
const Brand = () => {
    const [req, setReq] = useState(initReq);
    const [pageInfo, setPageInfo] = useState(initPageInfo)
    const [name, setName] = useState("");
    const { register, handleSubmit } = useForm();
    const [loading, setLoading] = useState(false)
    const [id, setId] = useState("")
    format(new Date(), 'dd/mm/yyyy')
    const [Brand, setBrand] = useState([]);
    const navigate = useNavigate()

    useEffect(() => {
        getAllBrand();
    }, [req])

    const getAllBrand = async () => {
        setLoading(true)
        try {
            const res = await AxiosApi.postAuth(WsUrl.ADMIN_BRAND_SEARCH, req)
            console.log("res", res);
            if (res) {
                const { data } = res
                console.log("getBrand data: ", data);
                setBrand(data.data)
                setPageInfo({
                    page: data.page,
                    pageSize: data.pageSize,
                    totalPages: data.totalPages,
                    totalElements: data.totalElements,
                })
            }
        } catch (e) {
            console.log("getBrand() error: ", e);
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = async (values) => {
        console.log("handleSubmitForm() start with values: ", values)
        setLoading(true)
        try {
            let payload = {
                id: '',
                name: values.brandName,
            }
            const res = await AxiosApi.postAuth(WsUrl.ADMIN_BRAND_CREATE, payload)
            if (res) {
                ToastUtils.createToast(WsToastType.SUCCESS, WsMessage.CREATED_DONE, 1000)
                setTimeout(() => {
                    navigate("/brand")
                }, 2000)
            }
        } catch (error) {
            ToastUtils.createToast(WsToastType.ERROR, error.response.data.message || WsMessage.INTERNAL_SERVER_ERROR, 2000)
        } finally {
            setLoading(false)
            getAllBrand()
        }
    }
    const onUpdate = async (values) => {
        console.log("handleSubmitForm() start with values: ", values)
        setLoading(true)
        try {
            let payload = {
                id: id,
                name: name,
            }
            console.log("update", payload)
            const res = await AxiosApi.postAuth(WsUrl.ADMIN_BRAND_UPDATE, payload)
            if (res) {
                ToastUtils.createToast(WsToastType.SUCCESS, WsMessage.UPDATE_SUCCESS, 1000)
                setTimeout(() => {
                    navigate("/brand")
                }, 2000)
            }
        } catch (error) {
            ToastUtils.createToast(WsToastType.ERROR, error.response.data.message || WsMessage.INTERNAL_SERVER_ERROR, 2000)
        } finally {
            setLoading(false)
            getAllBrand()
        }
    }

    const deleteBrand = async (id) => {
        setLoading(true)
        console.log(id)
        try {
            const res = await AxiosApi.postAuth(`${WsUrl.ADMIN_DELETE_BRAND}?id=${id}`)
            if (res) {
                ToastUtils.createToast(WsToastType.SUCCESS, WsMessage.UPDATE_SUCCESS)
            }
        } catch (error) {
            ToastUtils.createToast(WsToastType.ERROR, error.response.data.message || WsMessage.INTERNAL_SERVER_ERROR, 2000)
        } finally {
            setLoading(false)
            getAllBrand();
        }
    }

    const getBrand = async (id) => {
        // setLoading(true)
        try {
            const res = await AxiosApi.getAuth(`${WsUrl.ADMIN_BRAND_DETAIL}?id=${id}`)
            setName(res.data.name)
            setId(res.data.id)
        } catch (error) {
            ToastUtils.createToast(WsToastType.ERROR, error.response.data.message || WsMessage.INTERNAL_SERVER_ERROR, 2000)
        } finally {
            setLoading(false)
        }
    }

    const handleChangeStatus = async (id) => {
        setLoading(true)
        console.log(id)
        try {
            const res = await AxiosApi.postAuth(`${WsUrl.ADMIN_CHANGE_STATUS_BRAND}?id=${id}`)
            if (res) {
                ToastUtils.createToast(WsToastType.SUCCESS, WsMessage.UPDATE_SUCCESS)
            }
        } catch (error) {
            ToastUtils.createToast(WsToastType.ERROR, error.response.data.message || WsMessage.INTERNAL_SERVER_ERROR, 2000)
        } finally {
            setLoading(false)
            getAllBrand();
        }
    }

    const handleChangeStatusFilter = e => {
        const value = e.target.value
        console.log("handleChangeStatusFilter() value: ", value)
        let status = value === 'active' ? true : value === 'de-active' ? false : null
        console.log("handleChangeStatusFilter() status: ", status)
        setReq({
            ...req,
            active: status,
            pageReq: {
                ...req.pageReq,
                page: 0,
            }
        })
    }

    const handleChangeTextSearchFilter = values => {
        if (values.textSearch || values.textSearch.trim.length === 0) {
            setReq({
                ...req,
                textSearch: values.textSearch,
                pageReq: {
                    ...req.pageReq,
                    page: 0,
                }
            })
        }
    }

    const handleChangePageFilter = newPage => {
        setReq({
            ...req,
            pageReq: {
                ...req.pageReq,
                page: Number(newPage)
            }
        })
    }

    const handleChangePageSizeFilter = e => {
        setReq({
            ...req,
            pageReq: {
                ...req.pageReq,
                pageSize: Number(e.target.value)
            }
        })
    }
    return (
        <div className="container-fluid w-100 reponsive">
            <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex justify-content-between">
                    <h3 className="m-0 font-weight-bold text-primary">Danh sách thương hiệu</h3>
                    <a className='btn btn-primary' data-toggle="modal"
                        data-target={`#addModal${Brand.id}`}>Thêm mới</a>
                    <div className="modal fade" id={`addModal${Brand.id}`} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLabel"><b>Thêm thương hiệu</b></h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <form className="row modal-body">
                                    <div className="col-6">
                                        <label htmlFor="">Tên thương hiệu</label>
                                        <input type="text" className="form-control" {...register("brandName")} /><br />
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-dismiss="modal">Hủy</button>
                                        <button type="submit" className="btn btn-danger" onClick={handleSubmit(onSubmit)} data-dismiss="modal" >Thêm mới</button>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <div className='row d-flex align-items-center py-1'>
                        <div className='col d-flex align-items-center'>
                            <span className='' style={{ minWidth: '64px' }}>Bộ lọc:</span>
                            <select className='border-1 form-control col-2  mx-2' onChange={handleChangeStatusFilter}>
                                <option value='all'>Tất cả</option>
                                <option value='active'>Hoạt động</option>
                                <option value='de-active'>Ngưng hoạt động</option>
                            </select>
                        </div>
                        <form className="d-none d-sm-inline-block form-inline navbar-search col-4"
                            onSubmit={handleSubmit(handleChangeTextSearchFilter)}>
                            <div className="input-group">
                                <input type="text" className="form-control bg-light border-0 small"
                                    placeholder="Tìm kiếm..." aria-label="Search" aria-describedby="basic-addon2"
                                    defaultValue=""
                                    {...register("textSearch")} />
                                <div className="input-group-append">
                                    <button className="btn btn-primary" type="submit">
                                        <i className="fas fa-search fa-sm" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <hr />
                    <div className='table-responsive'>
                        <table className="table table-bordered mt-4" id="dataTable" width="100%" cellSpacing={0}>
                            <thead>
                                <tr className='text-bold text-dark'>
                                    <th className='text-center'>#</th>
                                    <th className='text-center'>Tên thương hiệu</th>
                                    {/* <th className='text-center'>Ngày tạo</th> */}
                                    <th className='text-center'>Trạng thái</th>
                                    <th className='text-center'>More</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? <HashSpinner /> : Brand && Brand.map((Brand, index) => (
                                    <tr className="border" key={Brand.id}>
                                        <td className='text-center'>{index + 1}</td>
                                        <td className='text-center'>{Brand.name}</td>
                                        {/* <td className='text-center'>{DateUtils.dateToString(Brand.createdDate, WSDateFormat.F_DDMMYYYYHHMM)}</td> */}
                                        <td className='text-center' style={{ minWidth: '80px' }}>
                                            <span className={`btn text-light badge badge-pill badge-success`}
                                                data-toggle="modal"
                                                data-target={`#changeStatusModal${Brand.id}`}>{Brand.status.value ? "Hoạt động" : ""}</span>
                                            <span className={`btn text-light badge badge-pill badge-danger`}
                                                data-toggle="modal"
                                                data-target={`#changeStatusModal${Brand.id}`}>{Brand.status.value == false ? "Ngưng hoạt động" : ""}</span>
                                        </td>

                                        <td className='text-center' >
                                            <div className="btn-group dropleft">
                                                <a className="btn text-dark" type="button" id="dropdownMenuButton"
                                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    <i className="fa fa-ellipsis-h" aria-hidden="true" />
                                                </a>
                                                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                    <a className="dropdown-item" href="#" data-toggle="modal"
                                                        data-target={`#editModal${Brand.id}`} onClick={() => getBrand(Brand.id)}>Chỉnh sửa</a>
                                                    <a className="dropdown-item" href="#" data-toggle="modal"
                                                        data-target={`#deleteModal${Brand.id}`}>Xóa</a>
                                                </div>
                                            </div>
                                            <div className="modal fade" id={`deleteModal${Brand.id}`} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                                <div className="modal-dialog" role="document">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <h5 className="modal-title" id="exampleModalLabel">Xóa thương hiệu</h5>
                                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                                <span aria-hidden="true">×</span>
                                                            </button>
                                                        </div>
                                                        <div className="modal-body">
                                                            Bạn có chắc muốn thương hiệu<b className=''> {Brand.name}</b> không? <br />
                                                        </div>
                                                        <div className="modal-footer">
                                                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Hủy</button>
                                                            <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={() => deleteBrand(Brand.id)} >Xóa</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="modal fade" id={`changeStatusModal${Brand.id}`} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                                <div className="modal-dialog" role="document">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <h5 className="modal-title" id="exampleModalLabel">Thay đổi trạng thái</h5>
                                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                                <span aria-hidden="true">×</span>
                                                            </button>
                                                        </div>
                                                        <div className="modal-body">
                                                            Bạn có chắc muốn thay đổi trạng thái màu <b className=''>{Brand.name}</b> không? <br />
                                                        </div>
                                                        <div className="modal-footer">
                                                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Hủy</button>
                                                            <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={() => handleChangeStatus(Brand.id)}>Xác nhận</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                            {/* ===========EDIT */}

                                            <div className="modal fade" id={`editModal${Brand.id}`} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                                <div className="modal-dialog" role="document">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <h5 className="modal-title" id="exampleModalLabel"><b>Sửa thương hiệu</b></h5>
                                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                                <span aria-hidden="true">×</span>
                                                            </button>
                                                        </div>
                                                        <form className="row modal-body">
                                                            
                                                            <div className="col-6">
                                                                <label className="text-center" htmlFor="">Tên thương hiệu</label>
                                                                <input className="form-control" value={name} onChange={e => setName(e.target.value)} /><br />
                                                            </div>
                                                            <div className="modal-footer">
                                                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Hủy</button>
                                                                <button type="submit" className="btn btn-danger" onClick={handleSubmit(onUpdate)} data-dismiss="modal" >Cập nhật</button>
                                                            </div>
                                                        </form>

                                                    </div>
                                                </div>
                                            </div>

                                        </td>

                                    </tr>
                                ))}

                            </tbody>
                        </table>

                    </div>

                    {pageInfo.totalElements > 0 && <div className='py-2 row align-items-center justify-content-between'>
                        <div className='col d-flex align-items-center'>
                            Hiển thị: <select className='border-1 form-control col-1 mx-2'
                                onChange={handleChangePageSizeFilter}>
                                <option value={10} defaultChecked>10</option>
                                <option value={20}>20</option>
                                <option value={10}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className=''>
                            <button className='btn btn-outline-dark btn-sm mx-1 px-2'
                                onClick={() => handleChangePageFilter(pageInfo.page - 1)}
                                disabled={pageInfo.page == 0}>Trước
                            </button>
                            <button className='btn btn-outline-dark btn-sm mx-1 px-2'
                                onClick={() => handleChangePageFilter(pageInfo.page + 1)}
                                disabled={pageInfo.page == pageInfo.totalPages - 1}>Sau
                            </button>
                            <span>Trang {pageInfo.page + 1}/{pageInfo.totalPages}</span>
                        </div>
                    </div>}
                </div>
            </div>
        </div>
    );
};
export default Brand;