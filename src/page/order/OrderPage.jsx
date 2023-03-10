import axios from 'axios'
import React, { useEffect, useState } from 'react'
import AxiosApi from '../../api/AxiosApi'
import WsUrl from "../../utils/constants/WsUrl";
import { useForm } from "react-hook-form";
import ToastUtils from '../../utils/ToastUtils';
import WsToastType from '../../utils/constants/WsToastType';
import WsMessage from '../../utils/constants/WsMessage';
import { NavLink, useParams, useNavigate } from 'react-router-dom'
import HashSpinner from "../../component/spinner/HashSpinner";
import GhnApi from '../../api/GhnApi';
import WSOrderStatus from '../../utils/constants/WSOrderStatus';

let location = {
    provinceId: null,
    districtId: null,
    wardId: null
};

const initReq = {
    id: null,
    status: null,
    cusId: null,
    provinceId: null,
    districtId: null,
    wardCode: null,
    time: null,
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


const OrderPage = () => {

    const navigate = useNavigate()

    const [provinces, setProvinces] = useState([])
    const [districts, setDistricts] = useState([])
    const [wards, setWards] = useState([])
    const [req, setReq] = useState(initReq)
    const [orders, setOrders] = useState([])
    const [pageInfo, setPageInfo] = useState(initPageInfo)
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit } = useForm()

    useEffect(() => {
        getProvincesFromOpenApi()
    }, [])

    useEffect(() => {
        console.log("HELLO ")
        getOrderList()
    }, [req])

    const getOrderList = async () => {
        setLoading(true)
        try {
            const axiosRes = await AxiosApi.postAuthV2(`${WsUrl.ADMIN_ORDER_SEARCH}`, req)
            if (axiosRes) {
                const { data } = axiosRes
                setOrders(data.data)
                setPageInfo({
                    ...pageInfo,
                    page: data.page,
                    pageSize: data.pageSize,
                    totalElements: data.totalElements,
                    totalPages: data.totalPages
                })
            }
        } catch (e) {
            console.log("Error: ", e)
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        } finally {
            setLoading(false)
        }
    }, getProvincesFromOpenApi = async () => {
        console.log('getProvincesFromOpenApi() start');
        const res = await GhnApi.getProvinces()
        console.log('getProvincesFromOpenApi() res: ', res);
        if (res) {
            setProvinces(res.data.data)
        }
    }, handleChangeProvinceFilter = e => {
        const value = e.target.value
        console.log('handleChangeProvinceFilter() value: ', value);
        location = {
            ...location,
            provinceId: value,
        }
        setReq({
            ...req,
            provinceId: value
        })
    }, handleChangeDistrictFilter = e => {
        const value = e.target.value
        console.log('handleChangeDistrictFilter() value: ', value);
        location = {
            ...location,
            districtId: value
        }
        setReq({
            ...req,
            districtId: value
        })
    }, handleChangeWardFilter = e => {
        setReq({
            ...req,
            wardCode: e.target.value
        })
    }, handleClickDistrictFilter = async () => {
        console.log('handleClickDistrictFilter() start with location: ', location);
        if (location && location.provinceId) {
            const res = await GhnApi.getDistricts(location.provinceId)
            console.log('handleClickDistrictFilter() res: ', res);
            if (res) {
                setDistricts(res.data.data)
            }
        }
    }, handleClickWardFilter = async () => {
        console.log('handleClickWardFilter() start with location: ', location);
        if (location && location.districtId) {
            const res = await GhnApi.getWards(location.districtId)
            console.log('handleClickWardFilter() res: ', res);
            if (res) {
                setWards(res.data.data)
            }
        }
    }, handleRemoveLocationFilter = () => {
        document.getElementById('provinceFilter').value = ''
        // document.getElementById('districtFilter').value = ''
        // document.getElementById('wardFilter').value = ''
        setReq({
            ...req,
            provinceId: null,
            // districtId: null,
            // wardCode: null,
        })
    }, handleChangeStatusFilter = e => {
        const value = e.target.value
        console.log('value: ', value);
        setReq({
            ...req,
            status: value || null
        })
    }, handleChangeTimeFilter = e => {
        setReq({
            ...req,
            time: e.target.value,
        })
    }, handleChangeTextSearchFilter = values => {
        const textSearch = values.textSearch.trim() == '' ? null : values.textSearch.trim()
        setReq({
            ...req,
            textSearch: textSearch
        })
    }, handleChangePageSizeFilter = e => {
        setReq({
            ...req,
            pageReq: {
                ...req.pageReq,
                pageSize: Number(e.target.value)
            }
        })
    }, handleChangePageFilter = newPage => {
        setReq({
            ...req,
            pageReq: {
                ...req.pageReq,
                page: Number(newPage)
            }
        })
    }, handleChangeStatus = async (id, status) => {
        try {
            const obj = {
                id: id,
                status: status,
                note: document.getElementById('reason').value
            }
            const axiosRes = await AxiosApi.postAuth(WsUrl.ADMIN_ORDER_CHANGE_STATUS, obj)
            getOrderList()
            console.log(axiosRes)
            ToastUtils.createToast(WsToastType.SUCCESS, WsMessage.CHANGE_ORDER_STATUS_SUCCESS)
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message)
        }
    }, handleChangeOrderFilter = async e => {
        const input = e.target.value
        let sortField = ""
        let sortDirection = ""
        console.log("input: ", input, " - sortField: ", sortField, " - sortDirection: ", sortDirection)
        console.log("length: ", input.length)
        if (input.length > 0) {
            sortField = input.substring(0, input.indexOf('-'))
            console.log(sortField)
            sortDirection = input.substring(sortField.length + 1)
            console.log(sortDirection)
        }
        setReq({
            ...req,
            pageReq: {
                ...req.pageReq,
                sortField: sortField,
                sortDirection: sortDirection
            }
        })
    }

    return (
        <div className="container-fluid w-100 reponsive">
            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h3 className="m-0 font-weight-bold text-primary">Danh s??ch ????n h??ng</h3>
                </div>
                <div className="card-body">
                    <div className='row d-flex align-items-center py-1'>
                        <div className='col d-flex align-items-center'>
                            <span className='' style={{ minWidth: '64px' }}>Tr???ng th??i:</span>
                            <select className='border-1 form-control col-2 mx-2'
                                onChange={handleChangeStatusFilter}>
                                <option value="">T???t c???</option>
                                <option value={WSOrderStatus.PENDING}>??ang ch??? x??? l??</option>
                                <option value={WSOrderStatus.ACCEPTED}>???? x??c nh???n</option>
                                <option value={WSOrderStatus.REJECTED}>???? t??? ch???i</option>
                                <option value={WSOrderStatus.CANCELED}>???? h???y</option>
                                <option value={WSOrderStatus.SHIPPING}>??ang giao</option>
                                <option value={WSOrderStatus.RECEIVED}>???? nh???n h??ng</option>
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

                    <div className='row d-flex align-items-center px-3 py-1'>
                        <span className='' style={{ minWidth: '64px' }}>?????a ch???:</span>
                        <div className='col d-flex align-items-center'>
                            <select id='provinceFilter' className='border-1 form-control mx-1 col-2'
                                onChange={handleChangeProvinceFilter}>
                                <option value="" disabled selected text-muted>---T???nh/T.Ph???---</option>
                                {provinces && provinces.map(p => (
                                    <option key={p?.ProvinceID} value={p?.ProvinceID}>{p?.ProvinceName}</option>
                                ))}
                            </select>
                            {/* <select id='districtFilter' className='border-1 form-control mx-1 col-2'
                                onChange={handleChangeDistrictFilter} onClick={handleClickDistrictFilter}>
                                <option value="" disabled selected text-muted>---Qu???n/Huy???n---</option>
                                {districts && districts.map(d => (
                                    <option key={d?.DistrictID} value={d?.DistrictID}>{d?.DistrictName}</option>
                                ))}
                            </select>
                            <select id='wardFilter' className='border-1 form-control mx-1 col-2'
                                onClick={handleClickWardFilter} onChange={handleChangeWardFilter}>
                                <option value="" disabled selected>---Ph?????ng/X??---</option>
                                {wards && wards.map(w => (
                                    <option key={w?.WardCode} value={w?.WardCode}>{w?.WardName}</option>
                                ))}
                            </select> */}
                            <button className='btn btn-outline-danger' onClick={handleRemoveLocationFilter}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                                </svg>
                            </button>
                        </div>
                        <div className='row d-flex align-items-center'>
                            {/* <select className='form-control col mx-1' onChange={handleChangeTimeFilter}>
                                <option value="" disabled selected>---Th???i gian ?????t---</option>
                                <option value="">M???c ?????nh</option>
                                <option value="day">H??m nay</option>
                                <option value="week">Tu???n n??y</option>
                                <option value="month">Th??ng n??y</option>
                            </select> */}
                            <select className='form-control col mx-1' onChange={handleChangeOrderFilter}>
                                <option value="" disabled selected>---S???p x???p---</option>
                                <option value="">M???c ?????nh</option>
                                <option value="user.lastName-asc">T??n Kh??ch h??ng(a-z)</option>
                                <option value="user.lastName-desc">T??n Kh??ch h??ng(z-a)</option>
                                <option value="total-asc">T???ng ti???n(Th???p-cao)</option>
                                <option value="total-desc">T???ng ti???n(Cao-th???p)</option>
                                <option value="createdDate-asc">Th???i gian ?????t(C??-m???i)</option>
                                <option value="createdDate-desc">Th???i gian ?????t(M???i-c??)</option>
                            </select>
                        </div>
                    </div>

                    <hr className='pb-2' />
                    <h6>T??m th???y <b>{pageInfo.totalElements}</b> d??? li???u ph?? h???p.</h6>
                    <div className='table-responsive'>
                        <table className="table table-bordered mt-4" id="dataTable" width="100%" cellSpacing={0}>
                            <thead>
                                <tr className='text-bold text-dark'>
                                    <th className='text-center' style={{ maxWidth: '40px' }}>#</th>
                                    <th>Code</th>
                                    <th>Kh??ch h??ng</th>
                                    <th>SDT</th>
                                    <th>Th???i gian ?????t</th>
                                    <th>?????a ch??? giao</th>
                                    <th>T???ng ti???n</th>
                                    <th>Ph????ng th???c</th>
                                    {/* <th>Ghi ch??</th> */}
                                    <th>Tr???ng th??i</th>
                                    <th>More</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? <HashSpinner /> :
                                    orders && orders.map((order, index) => (
                                        <tr key={order.id}>
                                            <td className='text-center' style={{ maxWidth: '40px' }}>{index + 1}</td>
                                            <td>{order.code}</td>
                                            <td className='col-1'>{order.customerName}</td>
                                            <td className="col-1">{order.phone}</td>
                                            <td>{order.createdDateFmt}</td>
                                            <td className="col-2">{order.addressCombination}</td>
                                            <td className='col-1'>{order.totalFmt}</td>
                                            <td>{order.payment}</td>
                                            {/* <td>{order.note}</td> */}
                                            <td className="col-2" >
                                                <span className="btn bg-primary text-light" data-toggle="modal"
                                                    data-target={`#statusModal${order.id}`}>
                                                    {order.statusCombination}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="btn-group dropleft">
                                                    <a className="btn text-dark" type="button" id="dropdownMenuButton"
                                                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                        <NavLink to={`detail/${order.id}`} className="dropdown-item">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye"
                                                                viewBox="0 0 16 16">
                                                                <path
                                                                    d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                                                <path
                                                                    d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                                            </svg>
                                                        </NavLink>
                                                    </a>
                                                    {/* <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                        <NavLink to={`detail/${order.id}`} className="dropdown-item">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye"
                                                                viewBox="0 0 16 16">
                                                                <path
                                                                    d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                                                <path
                                                                    d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                                            </svg>
                                                        </NavLink>
                                                        <a className="dropdown-item" href="#" data-toggle="modal"
                                                            data-target={`#statusModal${order.id}`}>Ch???nh s???a tr???ng th??i</a>
                                                    </div> */}
                                                </div>
                                                <div className="modal fade" id={`statusModal${order.id}`} tabIndex={-1}
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
                                                            {order.options &&
                                                                <div className="modal-body p-4">
                                                                    <div className="form-group mt-2">
                                                                        <h6 className='text-dark'><b>1. L?? do ch???nh s???a</b> (kh??ng b???t bu???c)</h6>
                                                                        <textarea id='reason' className='form-control'
                                                                            rows={4}></textarea>
                                                                    </div>
                                                                    <h6 className='text-dark'><b>2. Ch???n tr???ng th??i m???i cho ????n h??ng</b></h6>
                                                                    <div className='row d-flex justify-content-left p-2'>
                                                                        {order.options.map((obj, index1) => (
                                                                            <button key={index1}
                                                                                className={`btn mr-2 btn-${obj.clazz}`}
                                                                                onClick={() => handleChangeStatus(order.id, obj.status)}
                                                                                data-dismiss="modal"
                                                                            >{obj.name}</button>
                                                                        ))}
                                                                    </div>
                                                                </div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>))}
                            </tbody>
                        </table>
                    </div>

                    {pageInfo.totalElements > 0
                        &&
                        <div className='p-2 row align-items-center justify-content-between'>
                            <div className='col d-flex align-items-center'>
                                Hi???n th???: <select className='border-1 form-control col-1 mx-2'
                                    onChange={handleChangePageSizeFilter}>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <div className=''>
                                <button className='btn btn-outline-dark btn-sm mx-1 px-2'
                                    onClick={() => handleChangePageFilter(pageInfo.page - 1)}
                                    disabled={pageInfo.page === 0}>Tr?????c
                                </button>
                                <button className='btn btn-outline-dark btn-sm mx-1 px-2'
                                    onClick={() => handleChangePageFilter(pageInfo.page + 1)}
                                    disabled={pageInfo.page === pageInfo.totalPages - 1}>Sau
                                </button>
                                <span>Trang {pageInfo.page + 1}/{pageInfo.totalPages}</span>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default OrderPage