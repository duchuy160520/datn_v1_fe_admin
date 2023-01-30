import React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import AxiosApi from '../../api/AxiosApi'
import WSSelected from '../../component/selecte/WSSelected'
import WsMessage from '../../utils/constants/WsMessage'
import WsToastType from '../../utils/constants/WsToastType'
import WsUrl from '../../utils/constants/WsUrl'
import ToastUtils from '../../utils/ToastUtils'
import DatePicker from "react-datepicker";
import DateUtils from '../../utils/common/DateUtils'
import WSDateFormat from '../../utils/constants/WSDateFormat'
import RadioGroup from '../../component/form/RadioGroup'
import HashSpinner from '../../component/spinner/HashSpinner'
import CodeUtils from '../../utils/common/CodeUtils'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

const typeObj = {
    name: 'typeRadio',
    registerName: 'type',
    data: [
        {
            id: 'percentTypeRadio',
            value: 'percent',
            defaultChecked: true,
            label: 'Theo phần trăm',
        },
        {
            id: 'priceTypeRadio',
            value: 'price',
            defaultChecked: false,
            label: 'Theo số tiền',
        },
        {
            id: 'shipTypeRadio',
            value: 'ship',
            defaultChecked: false,
            label: 'Miễn phí vận chuyển',
        },
    ]
}

const CreateDiscountPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [showShipType, setShowShipType] = useState(false)
    const [showPriceType, setShowPriceType] = useState(false)
    const [showPercentType, setShowPercentType] = useState(true)
    const [showCategorySelected, setShowCategorySelected] = useState(false)
    const [showProductSelected, setShowProductSelected] = useState(false)
    const [showTotalPrerequisite, setShowTotalPrerequisite] = useState(false)
    const [showQtyPrerequisite, setShowQtyPrerequisite] = useState(false)
    const [showCustomerSelected, setShowCustomerSelected] = useState(false)
    const [showCustomerTypeSelected, setShowCustomerTypeSelected] = useState(false)
    const [showUsageLimit, setShowUsageLimit] = useState(false)
    const [showEndDate, setShowEndDate] = useState(false)
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [customers, setCustomers] = useState([])
    const [customerTypes, setCustomerTypes] = useState([])
    const [categorySelected, setCategorySelected] = useState([])
    const [productSelected, setProductSelected] = useState([])
    const [customerTypeSelected, setCustomerTypeSelected] = useState([])
    const [customerSelected, setCustomerSelected] = useState([])
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [loading, setLoading] = useState(false)
    const [code, setCode] = useState(null)
    const [showPrerequisite, setShowPrerequisite] = useState(true)
    const navigate = useNavigate()

    const handleTypeClick = e => {
        const statusSelected = e.target.value
        console.log("handleTypeClick() statusSelected: ", statusSelected)
        if (statusSelected) {
            setShowPercentType(false)
            setShowPriceType(false)
            setShowShipType(false)
            setShowPrerequisite(true)
            switch (statusSelected) {
                case 'percent':
                    setShowPercentType(true)
                    break
                case 'price':
                    setShowPriceType(true)
                    break
                case 'ship':
                    setShowShipType(true)
                    setShowPrerequisite(false)
                    break
                default:
                    break
            }
        }
    }, handleApplyTypeClick = e => {
        const value = e.target.value
        console.log("handleApplyTypeClick() value: ", value)
        if (value) {
            setShowProductSelected(false)
            setShowCategorySelected(false)
            switch (value) {
                case 'category':
                    setShowCategorySelected(true)
                    getCategories()
                    break;
                case 'product':
                    setShowProductSelected(true)
                    getProducts()
                    break
                case 'all_product':
                    break
                default:
                    break;
            }
        }
    }, getCategories = async () => {
        try {
            console.log("getCategories() start")
            const res = await AxiosApi.getAuth(WsUrl.CATEGORY_NO_PAGE)
            console.log("getCategories() res: ", res)
            const { data } = res
            setCategories(data.data)
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        }
    }, getProducts = async () => {
        try {
            console.log("getProducts() start")
            const res = await AxiosApi.getAuth(WsUrl.PRODUCT_NO_PAGE)
            console.log("getProducts() res: ", res)
            const { data } = res
            setProducts(data.data)
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        }
    }, handlePrerequisiteClick = e => {
        const value = e.target.value
        console.log("handlePrerequisiteClick() value: ", value);
        if (value) {
            setShowQtyPrerequisite(false)
            setShowTotalPrerequisite(false)
            switch (value) {
                case 'total':
                    setShowTotalPrerequisite(true)
                    break
                case 'qty':
                    setShowQtyPrerequisite(true)
                    break
                case 'none':
                default:
                    break;
            }
        }
    }, handleCustomerClick = e => {
        const value = e.target.value
        console.log("handleCustomerClick() value: ", value)
        if (value) {
            setShowCustomerTypeSelected(false)
            setShowCustomerSelected(false)
            switch (value) {
                case 'group':
                    setShowCustomerTypeSelected(true)
                    getCustomerTypes()
                    break;
                case 'customer':
                    setShowCustomerSelected(true)
                    getCustomers()
                    break
                case 'all':
                default:
                    break;
            }
        }
    }, getCustomerTypes = async () => {
        console.log("getCustomerTypes() start");
        try {
            const res = await AxiosApi.getAuth(WsUrl.CUSTOMER_TYPE_NO_PAGE)
            console.log("getCustomerTypes() res: ", res);
            if (res) {
                const { data } = res
                setCustomerTypes(data)
            }
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        }
    }, getCustomers = async () => {
        console.log("getCustomers() start");
        try {
            const res = await AxiosApi.getAuth(WsUrl.CUSTOMER_NO_PAGE)
            console.log("getCustomers() res: ", res);
            if (res) {
                const { data } = res
                setCustomers(data)
            }
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        }
    }, handleHasUsageLimitChange = e => {
        console.log("handleHasUsageLimitChange() start");
        const value = e.target.checked
        console.log("handleHasUsageLimitChange() value: ", e.target.checked);
        setShowUsageLimit(value)
    }, handleSubmitForm = async values => {
        console.log("handleSubmitForm() start with values: ", values)
        setLoading(true)
        var applyTypeIds = []
        var customerIds = []
        try {
            switch (values.applyType) {
                case 'category':
                    applyTypeIds = categorySelected.map(o => (o.value))
                    break;
                case 'product':
                    applyTypeIds = productSelected.map(o => (o.value))
                    break
                case 'all_product':
                default:
                    break;
            }
            switch (values.customerType) {
                case 'customer':
                    customerIds = customerSelected.map(o => (o.value))
                    break;
                case 'group':
                    customerIds = customerTypeSelected.map(o => (o.value))
                    break
                case 'all':
                default:
                    break;
            }
            const payload = {
                code: values.code,
                type: values.type && values.type.toUpperCase(),
                typeValue: {
                    type: values.type,
                    percentageValue: values.percentageValue && String(values.percentageValue),
                    valueLimitAmount: values.valueLimitAmount && String(values.valueLimitAmount),
                    amountValue: values.amountValue && String(values.amountValue),
                    maximumShippingRate: values.maximumShippingRate && String(values.maximumShippingRate),
                    shipValueLimitAmount: values.shipValueLimitAmount && String(values.shipValueLimitAmount),
                },
                applyType: values.applyType && values.applyType.toUpperCase(),
                applyTypeIds: applyTypeIds,
                prerequisiteType: values.prerequisiteType ? values.prerequisiteType.toUpperCase() : 'NONE',
                prerequisiteTypeValue: {
                    type: values.prerequisiteType,
                    minimumSaleTotalPrice: values.totalPrerequisiteTypeValue && String(values.totalPrerequisiteTypeValue),
                    minimumQuantity: values.qtyPrerequisiteTypeValue && String(values.qtyPrerequisiteTypeValue),
                },
                customerType: values.customerType.toUpperCase(),
                customerIds: customerIds,
                usageLimit: values.usageLimit && String(values.usageLimit),
                oncePerCustomer: values.oncePerCustomer,
                startDate: startDate && DateUtils.dateToString(startDate, WSDateFormat.F_DDMMYYYYHHMM),
                hasEndDate: values.hasEndDate,
                endDate: values.hasEndDate && DateUtils.dateToString(endDate, WSDateFormat.F_DDMMYYYYHHMM),
            }
            console.log("handleSubmitForm() payload: ", payload)
            const res = await AxiosApi.postAuth(WsUrl.ADMIN_DISCOUNT_CREATE, payload)
            console.log("handleSubmitForm() call api res : ", res)
            if (res) {
                ToastUtils.createToast(WsToastType.SUCCESS, WsMessage.CREATED_DONE, 1000)
                setTimeout(() => {
                    navigate("/")
                }, 2000)
            }
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        } finally {
            setLoading(false)
        }

    }, handleHasEndDateClick = e => {
        console.log("handleHasEndDateClick() start");
        const value = e.target.checked
        console.log("handleHasEndDateClick() value: ", value);
        setShowEndDate(value)
    }, handleEndDateChange = date => {
        console.log("handleEndDateChange() value: ", date)
        setEndDate(date)
    }, handleStartDateChange = date => {
        console.log("handleStartDateChange() value: ", date)
        setStartDate(date)
    }, handleOnChangeCode = e => {
        let value = e.target.value
        console.log("handleOnChangeCode() start with: ", value);
        if (value && value.trim().length >= 0) {
            value = value.replace(' ', '').toUpperCase()
            setCode(value.replace(' ', '').toUpperCase())
        }
    }, handleGenerateRandomCode = () => {
        var codeGen = CodeUtils.generateCode(8)
        console.log("handleGenerateRandomCode() code: ", codeGen.toUpperCase());
        setCode(codeGen.toUpperCase())
    }

    return (
        <div className="container-fluid w-100 reponsive">
            <form className="card shadow mb-4" onSubmit={handleSubmit(handleSubmitForm)}>
                <div className="card-header py-3 d-flex align-items-center">
                    <Link to='/discount' className=''><i className="fa fa-arrow-left" aria-hidden="true" /></Link>
                    <span className='mx-1'></span>
                    <h4 className="m-0 font-weight-bold text-primary">Thêm mới khuyến mãi</h4>
                </div>
                {loading === true ? <HashSpinner /> : <div className="card-body d-flex justify-content-between">
                    <div className='col-8'>
                        <div className='form-group p-4 border'>
                            <div className='d-flex justify-content-between'>
                                <b><label htmlFor="" className="form-label">Mã khuyến mãi<span className='text-danger'>*</span></label></b>
                                <span className='btn text-primary' onClick={handleGenerateRandomCode}>Sinh mã ngẫu nhiên</span>
                            </div>
                            <input type="input" className="form-control py-3" placeholder='Khách hàng sẽ nhập mã khuyến mãi này ở màn hình thanh toán'
                                {...register("code", { required: true, minLength: 6 })} id='code' defaultValue={code} onChange={handleOnChangeCode} />
                            {errors.code && <>
                                {errors.code.type === 'required' && <span className='small text-danger'>Không được để trống</span>}
                                {errors.code.type === 'minLength' && <span className='small text-danger'>Độ dài phải lớn hơn 6 ký tự</span>} </>}
                            {/* <br /> */}
                            {/* <input type='button' onClick={handleGenerateRandomCode} className='btn btn-outline-primary mt-2' value='Sinh mã ngẫu nhiên' /> */}
                        </div>
                        <div className='form-group p-4 border'>
                            <b><label htmlFor="" className="form-label">Loại khuyến mãi</label></b>
                            <RadioGroup obj={typeObj} handleClick={handleTypeClick} registerForm={register} />
                        </div>

                        <div className='form-group p-4 border'>
                            <b><label htmlFor="" className="form-label">Giá trị</label></b>
                            {showPercentType ?
                                <div className='d-flex justify-content-between'>
                                    <div className='form-group col'>
                                        <label htmlFor="" className="form-label">Giá trị khuyến mãi(%)<span className='text-danger'>*</span></label>
                                        <input className="form-control col"{...register("percentageValue", { required: true, max: 100, min: 1 })} />
                                        {errors.percentageValue ? <>
                                            {errors.percentageValue.type === 'required' && <span className='small text-danger'>Không được để trống</span>}
                                            {errors.percentageValue.type === 'max' && <span className='small text-danger'>Không được lớn hơn 100</span>}
                                            {errors.percentageValue.type === 'min' && <span className='small text-danger'>Không được nhỏ hơn 1</span>}                                            {errors.percentageValue.type === 'min' && <span className='small text-danger'>Không được nhỏ hơn 1</span>}
                                        </> : null}
                                    </div>
                                    <div className='form-group col'>
                                        <label htmlFor="" className="form-label">Giá trị giảm tối đa (VND):</label>
                                        <input className="form-control col" {...register("valueLimitAmount")} />
                                    </div>
                                </div> : null}

                            {showPriceType ?
                                <div className='form-group col-6'>
                                    <label htmlFor="" className="form-label">Giá trị khuyến mãi(VND)<span className='text-danger'>*</span></label>
                                    <input type="number" className="form-control" {...register("amountValue", { required: true, min: 1 })} />
                                    {errors.amountValue ? <>
                                        {errors.amountValue.type === 'required' && <span className='small text-danger'>Không được để trống</span>}
                                        {errors.amountValue.type === 'min' && <span className='small text-danger'>Không được nhỏ hơn 1</span>}
                                    </> : null}
                                </div> : null}
                            {showShipType ?
                                <div className='d-flex justify-content-between'>
                                    <div className='form-group col'>
                                        <label htmlFor="" className="form-label">Miễn phí tối đa(VND)</label>
                                        <input type="input" className="form-control"{...register("shipValueLimitAmount")} />
                                    </div>
                                    <div className='form-group col'>
                                        <label htmlFor="" className="form-label">Áp dụng với phí vận chuyển dưới (VND):</label>
                                        <input type="number" className="form-control" {...register("maximumShippingRate")} />
                                    </div>
                                </div> : null}
                        </div>

                        {showPrerequisite && <div className='form-group p-4 border'>
                            <b><label htmlFor="" className="form-label">Áp dụng cho</label></b>
                            <div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="applyTypeRadio" id="all_atr" value={'all_product'} defaultChecked onClick={handleApplyTypeClick} {...register('applyType')} />
                                    <label className="form-check-label" htmlFor="all_atr">Tất cả sản phẩm</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="applyTypeRadio" id="category_atr" value={'category'} onClick={handleApplyTypeClick} {...register('applyType')} />
                                    <label className="form-check-label" htmlFor="category_atr">Danh mục sản phâm</label>
                                    {showCategorySelected && <WSSelected options={categories.map(o => ({ label: `${o.name} (${o.productNumber})`, value: o.id }))} selected={categorySelected} setSelected={setCategorySelected} />}
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="applyTypeRadio" id="product_atr" value={'product'} onClick={handleApplyTypeClick} {...register('applyType')} />
                                    <label className="form-check-label" htmlFor="product_atr">Sản phẩm</label>
                                    {showProductSelected && <WSSelected options={products.map(o => ({ label: o.name, value: o.id }))} selected={productSelected} setSelected={setProductSelected} />}
                                </div>
                            </div>
                        </div>}
                        {showPrerequisite && <div className='form-group p-4 border'>
                            <b><label htmlFor="" className="form-label">Điều kiện áp dụng</label></b>
                            <div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="prerequisiteRadio" id="prerequisiteNoneRadio" value={'none'} defaultChecked onClick={handlePrerequisiteClick} {...register('prerequisiteType')} />
                                    <label className="form-check-label" htmlFor="prerequisiteNoneRadio">Không có</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="prerequisiteRadio" id="prerequisiteTotalRadio" value={'total'} onClick={handlePrerequisiteClick} {...register('prerequisiteType')} />
                                    <label className="form-check-label" htmlFor="prerequisiteTotalRadio">Tổng giá trị đơn hàng tối thiểu</label>
                                    {showTotalPrerequisite &&
                                        <><input type="number" className="form-control my-2" placeholder='(VND)' {...register("totalPrerequisiteTypeValue", { required: true, min: 1 })} />
                                            {errors.totalPrerequisiteTypeValue ? <>
                                                {errors.totalPrerequisiteTypeValue.type === 'required' && <span className='small text-danger'>Không được để trống</span>}
                                                {errors.totalPrerequisiteTypeValue.type === 'min' && <span className='small text-danger'>Không được nhỏ hơn 1</span>}
                                            </> : null}</>}
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="prerequisiteRadio" id="prerequisiteQtyRadio" value={'qty'} onClick={handlePrerequisiteClick} {...register('prerequisiteType')} />
                                    <label className="form-check-label" htmlFor="prerequisiteQtyRadio">Tổng số lượng sản phẩm được khuyến mãi tối thiếu</label>
                                    {showQtyPrerequisite &&
                                        <><input type="number" className="form-control mt-2" placeholder='Số lượng...' {...register("qtyPrerequisiteTypeValue", { required: true, min: 1 })} />
                                            {errors.qtyPrerequisiteTypeValue ? <>
                                                {errors.qtyPrerequisiteTypeValue.type === 'required' && <span className='small text-danger'>Không được để trống</span>}
                                                {errors.qtyPrerequisiteTypeValue.type === 'min' && <span className='small text-danger'>Không được nhỏ hơn 1</span>}
                                            </> : null}</>}
                                </div>
                            </div>
                        </div>}

                        <div className='form-group p-4 border'>
                            <b><label htmlFor="" className="form-label">Nhớm khách hàng</label></b>
                            <div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="customerRadio" id="allRadio" value={'all'} defaultChecked onClick={handleCustomerClick} {...register('customerType')} />
                                    <label className="form-check-label" htmlFor="allRadio">Tất cả</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="customerRadio" id="customerTypeRadio" value={'group'} onClick={handleCustomerClick} {...register('customerType')} />
                                    <label className="form-check-label" htmlFor="customerTypeRadio">Nhóm khách hàng</label>
                                    {showCustomerTypeSelected && <WSSelected options={customerTypes.map(o => ({ label: `${o.name} (${o.customerNumber})`, value: o.id }))} selected={customerTypeSelected} setSelected={setCustomerTypeSelected} />}
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="customerRadio" id="customerRadio" value={'customer'} onClick={handleCustomerClick} {...register('customerType')} />
                                    <label className="form-check-label" htmlFor="customerRadio">Khách hàng</label>
                                    {showCustomerSelected && <WSSelected options={customers.map(o => ({ label: `${o.name} (${o.email})`, value: o.id }))} selected={customerSelected} setSelected={setCustomerSelected}
                                    />}
                                </div>
                            </div>
                        </div>
                        <div className='form-group p-4 border'>
                            <b><label htmlFor="" className="form-label">Giới hạn sử dụng</label></b>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="hasUsageLimit" onChange={handleHasUsageLimitChange} />
                                <label className="form-check-label" htmlFor="hasUsageLimit">Giới hạn số lần mã giảm giá được áp dụng</label>
                                {showUsageLimit &&
                                    <><input type="number" className="form-control my-2" placeholder='Tổng số mã' {...register("usageLimit", { required: true, min: 1 })} />
                                        {errors.usageLimit ? <>
                                            {errors.usageLimit.type === 'required' && <span className='small text-danger'>Không được để trống</span>}
                                            {errors.usageLimit.type === 'min' && <span className='small text-danger'>Không được nhỏ hơn 1</span>}
                                        </> : null}</>}
                            </div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="oncePerCustomer" {...register('oncePerCustomer')} />
                                <label className="form-check-label" htmlFor="oncePerCustomer">Giới hạn mỗi khách hàng chỉ được sử dụng mã giảm giá này 1 lần</label>
                                <br />
                                <span className='small'>Kiểm tra bằng Email</span>
                            </div>
                        </div>

                        <div className='form-group p-4 border'>
                            <b><label htmlFor="" className="form-label">Thời gian</label></b>
                            <div className="form-group">
                                <label htmlFor="" className="form-label">Bắt đầu<span className='text-danger'>*</span></label>
                                <DatePicker className='form-control' selected={startDate} onChange={handleStartDateChange} showTimeSelect dateFormat="dd/MM/yyyy HH:mm" />
                            </div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="hasEndDate" onClick={handleHasEndDateClick} {...register('hasEndDate')} />
                                <label className="form-check-label" htmlFor="hasEndDate">Thời gian kết thúc</label>
                            </div>
                            {showEndDate &&
                                <div className="form-group mt-2">
                                    <label htmlFor="" className="form-label">Kết thúc<span className='text-danger'>*</span></label>
                                    <DatePicker className='form-control' selected={endDate} onChange={handleEndDateChange} showTimeSelect dateFormat="dd/MM/yyyy HH:mm" />
                                </div>}
                        </div>
                    </div>
                </div>}
                <div className="card-footer d-flex justify-content-eight">
                    <input type='submit' className='btn btn-primary mt-2' value={'Lưu'} />
                </div>
            </form>
        </div>
    )
}

export default CreateDiscountPage