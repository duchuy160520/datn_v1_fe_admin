import React, { useState } from 'react'
import { useEffect } from 'react';
import DatePicker from "react-datepicker";
import AxiosApi from '../../../api/AxiosApi';
import DateUtils from '../../../utils/common/DateUtils';
import ReportTimeType from '../../../utils/constants/ReportTimeType';
import WSDateFormat from '../../../utils/constants/WSDateFormat';
import WsMessage from '../../../utils/constants/WsMessage';
import WsToastType from '../../../utils/constants/WsToastType';
import WsUrl from '../../../utils/constants/WsUrl';
import ToastUtils from '../../../utils/ToastUtils';
import HashSpinner from '../../../component/spinner/HashSpinner'
import FileService from '../../../service/FileService';

const initReq = {
    type: 'DAYS_AGO30',
    start: null,
    end: null,
    direction: null,
}

const RevenueDetailReportPage = () => {

    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [timeText, setTimeText] = useState(ReportTimeType.DAYS_AGO30)
    const [timeTypes, setTimeTypes] = useState([])
    const [loading, setLoading] = useState(false)
    const [timeTypeSelected, setTimeTypeSelected] = useState('DAYS_AGO30')
    const [selectedOptionTime, setSelectedOptionTime] = useState(false)
    const [total, setTotal] = useState(null)
    const [req, setReq] = useState(initReq)
    const [details, setDetails] = useState(null)
    const [direction, setDirection] = useState(null)

    useEffect(() => {
        getTimeTypes()
    }, [])

    useEffect(() => {
        getRevenueDetails()
    }, [req])

    const getRevenueDetails = async () => {
        setLoading(true)
        try {
            console.log("getRevenueDetails() start with payload: ", req);
            const axiosRes = await AxiosApi.postAuth(WsUrl.ADMIN_REPORT_REVENUE_DETAIL, req)
            console.log("getRevenueDetails() res: ", axiosRes);
            if (axiosRes) {
                const { data } = axiosRes
                setDetails(data.data)
                setTotal(data.total)
            }
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        } finally {
            setLoading(false)
        }
    }


    const getTimeTypes = async () => {
        setLoading(true)
        try {
            const axiosRes = await AxiosApi.getAuth(WsUrl.ADMIN_REPORT_TIME_TYPE)
            console.log("getTimeTypes() res: ", axiosRes);
            if (axiosRes) {
                const { data } = axiosRes
                setTimeTypes(data)
            }
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        } finally {
            setLoading(false)
        }
    }

    const handleStartDateChange = date => {
        setSelectedOptionTime(true)
        setTimeTypeSelected(null)
        if (date > endDate) {
            setEndDate(date)
        }
        setStartDate(date)
    }

    const handleEndDateChange = date => {
        setSelectedOptionTime(true)
        setTimeTypeSelected(null)
        if (date < startDate) {
            setStartDate(date)
        }
        setEndDate(date)
    }

    const handleSubmit = async () => {
        const startDateStr = DateUtils.dateToString(startDate, WSDateFormat.F_DDMMYYYY)
        const endDateStr = DateUtils.dateToString(endDate, WSDateFormat.F_DDMMYYYY)
        const payload = {
            type: timeTypeSelected || null,
            start: startDateStr,
            end: endDateStr,
            direction: direction,
        }
        console.log('handleSummitType start with payload: ', payload);
        setReq(payload)
        if (timeTypeSelected) {
            setTimeText(ReportTimeType?.[timeTypeSelected])
        } else {
            setTimeText(`${startDateStr} - ${endDateStr}`)
        }
    }

    const handleChangeTimeType = e => {
        setSelectedOptionTime(false)
        const value = e.target.value
        console.log('handleChangeTimeType() value: ', value);
        setTimeTypeSelected(value)
    }

    const handleChangeDirection = e => {
        const value = e.target.value
        console.log('handleChangeDirection() start with value: ', value);
        setDirection(value)
        setReq({
            ...req,
            direction: value
        })
    }

    const handleExport = async () => {
        console.log("handleExport() start with payload: ", req);
        setLoading(true)
        try {
            const axiosRes = await AxiosApi.postAuthExport(WsUrl.ADMIN_REPORT_REVENUE_DETAIL_EXPORT, req)
            if (axiosRes) {
                FileService.saveByteArray(axiosRes, 'Baocaodoanhthu')
            }
        } catch (e) {
            console.log("handleExport() error: ", e);
            ToastUtils.createToast(WsToastType.ERROR, WsMessage.EXPORT_FAILED, 2000)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container-fluid w-100 reponsive">
            <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex justify-content-between">
                    <h3 className="m-0 font-weight-bold text-primary">Doanh s??? theo th???i gian</h3>
                </div>
                <div className="card-body">
                    <div className='mb-3 d-flex justify-content-between'>
                        <div className='d-flex align-items-center'>
                            <div className='d-flex align-items-center mb-2 mr-3'>
                                {/* <label htmlFor="">Kho???ng th???i gian</label> */}
                                <select className='form-control' onChange={handleChangeTimeType} onClick={handleSubmit}>
                                    <option selected={timeTypeSelected} value="">{timeText}</option>
                                    {timeTypes?.map((obj, index) => (
                                        <option key={index} value={obj.code}>{obj.value}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group mb-2 d-flex justify-content-between mr-3">
                                <div className='mr-3'>
                                    {/* <label htmlFor="">B???t ?????u</label> */}
                                    <DatePicker className='btn btn-outline-primary' selected={startDate} onChange={handleStartDateChange} dateFormat="dd/MM/yyyy" maxDate={new Date()} />
                                </div>
                                <div className=''>
                                    {/* <label htmlFor="">K???t th??c</label> */}
                                    <DatePicker className='btn btn-outline-primary' selected={endDate} onChange={handleEndDateChange} dateFormat="dd/MM/yyyy" maxDate={new Date()} />
                                </div>
                            </div>
                            <button className="btn btn-primary mb-2" data-dismiss="modal" onClick={handleSubmit}>??p d???ng</button>
                            {/* <span className='mx-2'>{timeText}</span> */}

                            <div className="modal fade" id="timeModal" tabIndex={-1} role="dialog">
                                <div className="modal-dialog modal-lg" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="timeModal">Ch???n th???i gian</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">??</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            <div className="form-group mb-2">
                                                <label htmlFor="">Kho???ng th???i gian</label>
                                                <select className='form-control' onChange={handleChangeTimeType}>
                                                    <option selected={selectedOptionTime} value="">---T??y ch???n---</option>
                                                    {timeTypes?.map((obj, index) => (
                                                        <option key={index} value={obj.code}>{obj.value}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <hr />
                                            <div className="form-group mb-2 d-flex justify-content-between">
                                                <div className=''>
                                                    <label htmlFor="">B???t ?????u</label>
                                                    <DatePicker className='form-control btn btn-outline-primary' selected={startDate} onChange={handleStartDateChange} dateFormat="dd/MM/yyyy" maxDate={new Date()} />
                                                </div>
                                                <div className=''>
                                                    <label htmlFor="">K???t th??c</label>
                                                    <DatePicker className='form-control btn btn-outline-primary' selected={endDate} onChange={handleEndDateChange} dateFormat="dd/MM/yyyy" maxDate={new Date()} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button className="btn btn-secondary" data-dismiss="modal">H???y</button>
                                            <button className="btn btn-primary" data-dismiss="modal" onClick={handleSubmit}>??p d???ng</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <button type="button" className="btn btn-primary" onClick={handleExport}>
                            <i className="fas fa-download fa-sm text-white-50" /> Xu???t File
                        </button>
                    </div>

                    <hr />
                    <div className='d-flex justify-content-between align-items-center'>
                        <div className=''>{total && <b><h6>T???ng doanh thu: {total}</h6></b>}</div>
                        <div className='form-group col-2 d-flex justify-content-between align-items-center'>
                            <select className='form-control' onChange={handleChangeDirection}>
                                <option value='asc'>C?? nh???t</option>
                                <option value='desc'>M???i nh???t</option>
                            </select>
                        </div>
                    </div>

                    <div className='table-responsive'>
                        <table className="table table-bordered mt-4" id="dataTable" width="100%" cellSpacing={0}>
                            <thead>
                                <tr className='text-bold text-dark'>
                                    <th className=''>Th???i gian</th>
                                    <th className=''>SL ????n h??ng</th>
                                    <th className=''>Doanh thu</th>
                                    <th className=''>Gi???m gi??</th>
                                    {/* <th className=''>Tr??? l???i h??ng</th> */}
                                    <th className=''>Doanh thu th???c</th>
                                    <th className=''>V???n chuy???n</th>
                                    <th className=''>T???ng doanh thu</th>
                                    <th className=''>SL ?????t h??ng</th>
                                    {/* <th className=''>SL tr??? l???i</th> */}
                                    {/* <th className=''>S??? l?????ng th???c</th> */}
                                </tr>
                            </thead>
                            {loading ? <HashSpinner /> : <tbody>
                                {details?.map((obj, index) => (
                                    <tr key={index}>
                                        <td>{obj?.time}</td>
                                        <td>{obj?.orderNumber}</td>
                                        <td>{obj?.saleFmt}</td>
                                        <td>{obj?.discountFmt}</td>
                                        {/* <td>{obj?.refundFmt}</td> */}
                                        <td>{obj?.netSaleFmt}</td>
                                        <td>{obj?.shipFmt}</td>
                                        <td>{obj?.totalFmt}</td>
                                        <td>{obj?.productOrderNumber}</td>
                                        {/* <td>{obj?.productRefundNumber}</td> */}
                                        {/* <td>{obj?.productNumber}</td> */}

                                    </tr>
                                ))}
                            </tbody>}
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default RevenueDetailReportPage