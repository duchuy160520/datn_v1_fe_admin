import React, { useState } from 'react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import AxiosApi from '../../api/AxiosApi'
import WSSelected from '../../component/selecte/WSSelected'
import HashSpinner from '../../component/spinner/HashSpinner'
import WsMessage from '../../utils/constants/WsMessage'
import WsToastType from '../../utils/constants/WsToastType'
import WsUrl from '../../utils/constants/WsUrl'
import ToastUtils from '../../utils/ToastUtils'
import { useNavigate } from 'react-router-dom'


var payload = {
    name: null,
    des: null,
    productIds: [],
}

const CreateCategoryPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [loading, setLoading] = useState(false)
    const [productSelected, setProductSelected] = useState([])
    const [products, setProducts] = useState([])
    const [types, setTypes] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        getProductNoPage()
        getTypes()
    }, [])

    const getTypes = async () => {
        console.log("getTypes() start");
        setLoading(true)
        try {
            const res = await AxiosApi.get(WsUrl.NO_AUTH_TYPE_NO_PAGE)
            console.log("res", res);
            if (res) {
                const { data } = res
                console.log("getTypes data: ", data);
                setTypes(data)
            }
        } catch (e) {
            console.log("getTypes() error: ", e);
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        } finally {
            setLoading(false)
        }
    }

    const getProductNoPage = async () => {
        try {
            console.log("getProducts() start")
            const res = await AxiosApi.getAuth(WsUrl.ADMIN_PRODUCT_NO_CATEGORY)
            console.log("getProducts() res: ", res)
            const { data } = res
            setProducts(data.data)
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        }
    }

    const handleSubmitForm = async values => {
        setLoading(true)
        console.log("handleSubmitForm() values: ", values);
        try {
            payload = {
                name: values.name,
                des: values.des,
                productIds: productSelected.map(o => (o.value)),
                typeId: values.typeId
            }
            console.log("handleSubmitForm() payload: ", payload);
            const resAxios = await AxiosApi.postAuth(WsUrl.ADMIN_CATEGORY_CREATE, payload)
            console.log("handleSubmitForm() resAxios: ", resAxios)
            if (resAxios) {
                ToastUtils.createToast(WsToastType.SUCCESS, WsMessage.CREATED_DONE)
                setTimeout(() => {
                    navigate("/category")
                }, 2000)
            } 
        } catch (e) {
            console.log("handleSubmitForm() error: ", e)
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR, 2000)
        } finally {
            setLoading(false)
        }

    }

    return (
        <div className="container-fluid w-100 reponsive">
            <form className="card shadow mb-4" onSubmit={handleSubmit(handleSubmitForm)}>
                <div className="card-header py-3 d-flex align-items-center">
                    <Link to='/category' className=''><i className="fa fa-arrow-left" aria-hidden="true" /></Link>
                    <span className='mx-1'></span>
                    <h3 className="m-0 font-weight-bold text-primary">Th??m m???i danh m???c</h3>
                </div>
                {loading ? <HashSpinner /> : 
                <div className="card-body d-flex justify-content-between">
                    <div className='col-8'>
                        <div className='form-group'>
                            <b><label htmlFor="" className="form-label">Ph??n lo???i<span className='text-danger'>*</span></label></b>
                            <select className='border-1 form-control' {...register('typeId')}>
                                {types && types.map((obj, index) => (
                                    <option key={index} value={obj.id}>{obj.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className='form-group'>
                            <b><label htmlFor="" className="form-label">T??n danh m???c<span className='text-danger'>*</span></label></b>
                            <input type="input" className="form-control py-3" {...register("name", { required: true, minLength: 4 })} />
                            {errors.name && <>
                                {errors.name.type === 'required' && <span className='small text-danger'>Kh??ng ???????c ????? tr???ng</span>}
                                {errors.name.type === 'minLength' && <span className='small text-danger'>????? d??i ph???i l???n h??n 4 k?? t???</span>} </>}
                        </div>

                        <div className='form-group'>
                            <b><label htmlFor="" className="form-label">M?? t???<span className='text-danger'>*</span></label></b>
                            <textarea className='form-control' rows={6} {...register('des', { required: true, minLength: 4, maxLength: 500 })}></textarea>
                            {errors.des &&
                                <>
                                    {'required' === errors.des.type && <span className='small text-danger'>Kh??ng ???????c ????? tr???ng</span>}
                                    {'minLength' === errors.des.type && <span className='small text-danger'>????? d??i ph???i l???n h??n 4 k?? t???</span>}
                                    {'maxLength' === errors.des.type && <span className='small text-danger'>????? d??i ph???i nh??? h??n 500 k?? t???</span>}
                                </>}
                        </div>

                        {/* <div className='form-group'>
                            <b><label htmlFor="" className="form-label">Danh s??ch s???n ph???m</label></b>
                            <WSSelected options={products.map(o => ({ label: o.name, value: o.id }))} selected={productSelected} setSelected={setProductSelected} />
                        </div> */}
                    </div>

                </div>}
                <div className="card-footer d-flex justify-content-eight">
                    <input type='submit' className='btn btn-primary mt-2 px-4' value={'L??u'} />
                </div>
            </form>
        </div>
    )
}

export default CreateCategoryPage