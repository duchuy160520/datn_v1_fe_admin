import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { useEffect } from 'react';
import AxiosApi from '../../api/AxiosApi';
import WsUrl from '../../utils/constants/WsUrl';
import HashSpinner from '../../component/spinner/HashSpinner';
import WsToastType from '../../utils/constants/WsToastType';
import WsMessage from '../../utils/constants/WsMessage';
import ToastUtils from '../../utils/ToastUtils';

const initReq = {
    status: null,
    textSearch: null,
    pageReq: {
        page: 0,
        pageSize: 10,
        sortField: '',
        sortDirection: ''
    }
};

let initPageInfo = {
    page: null,
    pageSize: null,
    totalElements: null,
    totalPages: null,
};

const DiscountListPage = () => {
    const { register, handleSubmit } = useForm()
    const navigate = useNavigate()
    const [req, setReq] = useState(initReq)
    const [pageInfo, setPageInfo] = useState(initPageInfo)
    const [loading, setLoading] = useState(true)
    const [discounts, setDiscounts] = useState([])

    useEffect(() => {
        getDiscounts()
    }, [req])

    const getDiscounts = async () => {
        try {
            setLoading(true)
            const res = await AxiosApi.postAuth(WsUrl.ADMIN_DISCOUNT_SEARCH, req)
            console.log("res", res);
            if (res) {
                const { data } = res
                console.log("data: ", data);
                setDiscounts(data.data)
                setPageInfo({
                    ...pageInfo,
                    page: data.page,
                    pageSize: data.pageSize,
                    totalElements: data.totalElements,
                    totalPages: data.totalPages
                })
                setLoading(false)
            }
        } catch (e) {
            console.log("Error: ", e)
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        }
    }


    const handleChangeTextSearchFilter = values => {
        if (values.textSearch || values.textSearch.trim.length === 0) {
            setReq({
                ...req,
                textSearch: values.textSearch
            })
        }
    }

    const handleChangeStatusFilter = e => {
        const value = e.target.value
        console.log("status value: ", value)
        setReq({
            ...req,
            status: value || null
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

    const handleChangePageFilter = newPage => {
        setReq({
            ...req,
            pageReq: {
                ...req.pageReq,
                page: Number(newPage)
            }
        })
    }
    const handleChangeStatus = async (id, status) => {
        try {
            const obj = {
                id: id,
                status: status,
                note: null
            }
            const axiosRes = await AxiosApi.postAuth(WsUrl.ADMIN_DISCOUNT_CHANGE_STATUS, obj)
            getDiscounts()
            console.log(axiosRes)
            ToastUtils.createToast(WsToastType.SUCCESS, WsMessage.CHANGE_ORDER_STATUS_SUCCESS)
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message)
        }
    }
    const handleDelete = async (id, canEdit) => {
        console.log("handleDelete() start with payload: ", id);
        if (!canEdit) {
            ToastUtils.createToast(WsToastType.ERROR, WsMessage.DISCOUNT_HAS_USED_CAN_NOT_DELETE, 2000)
            return false
        }
        setLoading(true)
        try {
            const res = await AxiosApi.postAuth(`${WsUrl.ADMIN_DISCOUNT_DELETE}?id=${id}`)
            if (res) {
                ToastUtils.createToast(WsToastType.SUCCESS, WsMessage.DELETE_SUCCESS)
                getDiscounts()
            }
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR, 2000)
        } finally {
            setLoading(false)
        }

    }

    return (
        <div className="container-fluid w-100 reponsive">
            <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex justify-content-between">
                    <h3 className="m-0 font-weight-bold text-primary">Danh s??ch khuy???n m??i</h3>
                    <NavLink to={'/discount/create'} className='btn btn-primary'>Th??m m???i</NavLink>
                    {/* <a className='btn btn-primary'>Th??m m???i</a> */}
                </div>
                <div className="card-body">
                    <div className='row d-flex align-items-center py-1'>
                        <div className='col d-flex align-items-center'>
                            <span className='' style={{ minWidth: '64px' }}>Tr???ng th??i:</span>
                            <select className='border-1 form-control col-2 mx-2'
                                onChange={handleChangeStatusFilter}>
                                <option value=''>T???t c???</option>
                                <option value="ACTIVE">??ang ??p d???ng</option>
                                <option value="PENDING">Ch??a ??p d???ng</option>
                                <option value="DE_ACTIVE">Ng???ng ??p d???ng</option>
                            </select>
                        </div>

                        <form className="d-none d-sm-inline-block form-inline navbar-search col-4"
                            onSubmit={handleSubmit(handleChangeTextSearchFilter)}>
                            <div className="input-group">
                                <input type="text" className="form-control bg-light border-0 small"
                                    placeholder="T??m ki???m..." aria-label="Search" aria-describedby="basic-addon2"
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

                    <hr className='pb-2' />
                    <h6>T??m th???y <b>{pageInfo.totalElements}</b> d??? li???u ph?? h???p.</h6>
                    <div>
                        <b className='mt-2'>Note<span className='text-danger'>*</span>: Nh???ng m?? khuy???n m??i ???? ???????c s??? d???ng s??? kh??ng ???????c ch???nh s???a</b>
                    </div>
                    <div className='table-responsive'>
                        <table className="table table-bordered mt-4" id="dataTable" width="100%" cellSpacing={0}>
                            <thead>
                                <tr className='text-bold text-dark'>
                                    <th className='text-center' style={{ maxWidth: '40px' }}>#</th>
                                    <th className=''>M??</th>
                                    <th className=''>Chi ti???t</th>
                                    <th className=''>Tr???ng th??i</th>
                                    <th className=''>???? d??ng</th>
                                    <th className=''>B???t ?????u</th>
                                    <th className=''>K???t th??c</th>
                                    <th className=''>More</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    loading ? <HashSpinner /> : discounts && discounts.map((obj, index) => (
                                        <tr key={obj.id}>
                                            <td className='text-center' style={{ maxWidth: '40px' }}>{index + 1}</td>
                                            <td className=''>{obj.code}</td>
                                            <td><ul>
                                                {obj.des.map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul></td>
                                            {/* <td className={obj.statusClazz}>{obj.statusName}</td> */}
                                            {/* <td className='text-center' style={{ minWidth: '80px' }}>
                                                <span className={`btn text-light badge badge-pill badge-success`}
                                                    data-toggle="modal"
                                                    data-target={`#changeStatusModal${obj.id}`}>{obj.status == true ? "??ang ??p d???ng" : ""}
                                                </span>
                                                <span className={`btn text-light badge badge-pill badge-danger`}
                                                    data-toggle="modal"
                                                    data-target={`#changeStatusModal${obj.id}`}>{obj.status == false ? "Ng??ng ??p d???ng" : ""}
                                                </span>
                                            </td> */}
                                            <td className="text-center" >
                                                <span
                                                    className={`btn text-light badge badge-pill badge-success`}
                                                    data-toggle="modal"
                                                    data-target={`#statusModal${obj.statusClazz}`}>
                                                    {obj.statusName}
                                                </span>
                                            </td>
                                            <td>{obj.usageNumber} {obj.usageLimit && `/${obj.usageLimit}`}</td>
                                            <td>{obj?.startDateFmt}</td>
                                            <td>{obj?.endDateFmt}</td>
                                            <td>
                                                <div className="btn-group dropleft">
                                                    <a className="btn text-dark" type="button" id="dropdownMenuButton"
                                                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                        <i className="fa fa-ellipsis-h" aria-hidden="true" />
                                                    </a>
                                                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                        {/* <NavLink to={`detail/${obj.id}`} className="dropdown-item">Ch???nh s???a</NavLink> */}
                                                        <NavLink to={`update/${obj.id}`} className="dropdown-item">Ch???nh s???a</NavLink>
                                                        <a className="dropdown-item" href="#" data-toggle="modal"
                                                            data-target={`#deleteDiscountModal${obj.id}`}>X??a</a>
                                                    </div>
                                                </div>
                                                <div className="modal fade" id={`deleteDiscountModal${obj.id}`} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                                    <div className="modal-dialog" role="document">
                                                        <div className="modal-content">
                                                            <div className="modal-header">
                                                                <h5 className="modal-title" id="exampleModalLabel">X??a m?? khuy???n m??i</h5>
                                                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                                    <span aria-hidden="true">??</span>
                                                                </button>
                                                            </div>
                                                            <div className="modal-body">
                                                                B???n c?? ch???c mu???n x??a m?? <b className=''>{obj.code}</b> kh??ng? <br />
                                                            </div>
                                                            <div className="modal-footer">
                                                                <button type="button" className="btn btn-secondary" data-dismiss="modal">H???y</button>
                                                                <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={() => handleDelete(obj.id, obj.canEdit)}>X??a</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* <div className="modal fade" id={`changeStatusModal${obj.id}`} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                                    <div className="modal-dialog" role="document">
                                                        <div className="modal-content">
                                                            <div className="modal-header">
                                                                <h5 className="modal-title" id="exampleModalLabel">Thay ?????i tr???ng th??i</h5>
                                                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                                    <span aria-hidden="true">??</span>
                                                                </button>
                                                            </div>
                                                            <div className="modal-body">
                                                                B???n c?? ch???c mu???n thay ?????i tr???ng th??i m?? khuy???n m??i <b className=''>{obj.code}</b> kh??ng? <br />
                                                            </div>
                                                            <div className="modal-footer">
                                                                <button type="button" className="btn btn-secondary" data-dismiss="modal">H???y</button>
                                                                <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={() => handleChangeStatus(obj.id)}>X??c nh???n</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div> */}

                                                <div className="modal fade" id={`statusModal${obj.statusClazz}`} tabIndex={-1}
                                                    role="dialog"
                                                    aria-labelledby="statusModalLabel" aria-hidden="true">
                                                    <div className="modal-dialog modal-lg" role="document">
                                                        <div className="modal-content">
                                                            <div className="modal-header">
                                                                <h5 className="modal-title" id="exampleModalLabel">Ch???nh s???a tr???ng th??i</h5>
                                                                <button type="button" className="close" data-dismiss="modal"
                                                                    aria-label="Close">
                                                                    <span aria-hidden="true">??</span>
                                                                </button>
                                                            </div>
                                                            <div className="modal-body">
                                                                B???n c?? ch???c mu???n thay ?????i tr???ng th??i m?? khuy???n m??i <b className=''>{obj.code}</b> kh??ng? <br />
                                                            </div>
                                                            <div className="modal-footer">
                                                                <button type="button" className="btn btn-secondary" data-dismiss="modal">H???y</button>
                                                                <button type="button" className="btn btn-primary" data-dismiss="modal" 
                                                                onClick={() => handleChangeStatus(obj.id, obj.status)}>X??c nh???n</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>


                    </div>

                    {pageInfo.totalElements > 0 && <div className='py-2 row align-items-center justify-content-between'>
                        <div className='col d-flex align-items-center'>
                            Hi???n th???: <select className='border-1 form-control col-1 mx-2'
                                onChange={handleChangePageSizeFilter}>
                                <option value={1} defaultChecked>10</option>
                                <option value={2}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className=''>
                            <button className='btn btn-outline-dark btn-sm mx-1 px-2'
                                onClick={() => handleChangePageFilter(pageInfo.page - 1)}
                                disabled={pageInfo.page == 0}>Tr?????c
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
        </div>)
}

export default DiscountListPage