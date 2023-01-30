import React, { useState } from 'react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, NavLink } from 'react-router-dom'
import AxiosApi from '../../api/AxiosApi'
import WSSelected from '../../component/selecte/WSSelected'
import HashSpinner from '../../component/spinner/HashSpinner'
import WsMessage from '../../utils/constants/WsMessage'
import WsToastType from '../../utils/constants/WsToastType'
import WsUrl from '../../utils/constants/WsUrl'
import ToastUtils from '../../utils/ToastUtils'
import ProductService from '../../service/ProductService'
import { useNavigate } from 'react-router-dom'

const CreateProductPage = () => {

    const { register, handleSubmit, formState: { errors } } = useForm()
    const [loading, setLoading] = useState(false)
    const [colorSelected, setColorSelected] = useState([])
    const [sizeSelected, setSizeSelected] = useState([])
    const [brands, setBrands] = useState([])
    const [categories, setCategories] = useState([])
    const [colors, setColors] = useState([])
    const [sizes, setSizes] = useState([])
    const [disableBtn, setDisableBtn] = useState(false)
    const [options, setOptions] = useState([])
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [formData, setFormData] = React.useState(new FormData());
    const [url, setUrl] = React.useState('');
    const [countNumber, setCountNumber] = useState([])
    const [countNumber2, setCountNumber2] = useState([])
    const [choose, setChoose] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        getSize()
        getCategories()
        getColor()
        getBrands()
    }, [])

    const getBrands = async () => {
        setLoading(true)
        try {
            const res = await AxiosApi.get(WsUrl.NO_AUTH_BRAND_NO_PAGE)
            const { data } = res
            if (data) {
                setBrands(data)
            }
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        } finally {
            setLoading(false)
        }
    }

    const getColor = async () => {
        try {
            const res = await AxiosApi.get(WsUrl.NO_AUTH_COLOR_NO_PAGE)
            const { data } = res
            if (data) {
                setColors(data)
            }
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        }
    }
    const getSize = async () => {
        try {
            const res = await AxiosApi.get(WsUrl.NO_AUTH_SIZE_NO_PAGE)
            const { data } = res
            if (data) {
                setSizes(data)
            }
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        }
    }

    const getCategories = async () => {
        try {
            console.log("getCategories() start")
            const res = await AxiosApi.get(WsUrl.NO_AUTH_CATEGORY_NO_PAGE)
            console.log("getCategories() res: ", res)
            const { data } = res
            if (data) {
                setCategories(data)
            }
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        }
    }

    const handleSubmitForm = async values => {
        setLoading(true)
        console.log('handleSubmitForm() start with values: ', values);
        try {
            const payload = {
                ...values,
                categoryId: values.categoryId || null,
                brandId: values.brandId || null,
                options: options,
            }
            console.log("handleSubmitForm() payload: ", payload)
            const axiosRes = await AxiosApi.postAuth(WsUrl.ADMIN_PRODUCT_CREATE, payload)
            if (axiosRes) {
                ToastUtils.createToast(WsToastType.SUCCESS, WsMessage.CREATED_DONE)
                setTimeout(() => {
                    navigate("/product")
                }, 2000)
            }
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        } finally {
            setLoading(false)
        }

    }

    const handleGenerateOptions = async () => {
        console.log('handleGenerateOptions() start');
        console.log('handleGenerateOptions() colorSelected: ', colorSelected);
        console.log('handleGenerateOptions() sizeSelected: ', sizeSelected);
        if (colorSelected.length == 0 || sizeSelected.length == 0) {
            return false
        }
        let colors1 = colorSelected.map(o => ({
            id: o.value,
            name: o.label,
        }))
        let sizes1 = sizeSelected.map(o => ({
            id: o.value,
            name: o.label,
        }))
        console.log('handleGenerateOptions() colors1: ', colors1);
        console.log('handleGenerateOptions() sizes1: ', sizes1);
        const result = ProductService.generateOptions(colors1, sizes1)
        console.log('handleGenerateOptions() result: ', result);

        setOptions(result)
    }

    const handleResetOptions = async () => {
        options.forEach(option => {
            if (option.image) {
                AxiosApi.deleteAuth(`${WsUrl.DELETE_FILE}?url=${option.image}`)
            }
        })
        setOptions([])
        setColorSelected([])
        setSizeSelected([])
    }

    const handleChange = (key, index, isImage) => async (event) => {
        console.log('handleChange key - index - isImage: ', key, index, isImage);
        let data = [...options]
        try {
            if (isImage) {
                setDisableBtn(true)
                const file = event.target.files[0];
                const oldImage = data[index][key]
                console.log("handleChange() oldImage: ", oldImage);
                if (oldImage) {
                    AxiosApi.deleteAuth(`${WsUrl.DELETE_FILE}?url=${oldImage}`)
                }
                let formData = new FormData()
                formData.append('file', file)
                const axiosRes = await AxiosApi.postAuthFormData(WsUrl.FILE_UPLOAD_IMAGE, formData)
                console.log('axiosRes: ', axiosRes);
                if (axiosRes) {
                    data[index][key] = axiosRes.data
                }
            } else {
                const value = event.target.value
                console.log('handleChange() value: ', value);
                data[index][key] = value
            }
            setOptions(data)
        } catch (e) {
            ToastUtils.createToast(WsToastType.ERROR, e.response.data.message || WsMessage.INTERNAL_SERVER_ERROR)
        } finally {
            setDisableBtn(false)
        }
    }

    const handleDeleteOption = index => {
        console.log('handleDeleteOption() start with index: ', index)
        console.log('handleDeleteOption() options: ', options);
        const optionDeleted = options[index]
        console.log('handleDeleteOption() optionDeleted: ', optionDeleted);
        if (optionDeleted && optionDeleted.image) {
            AxiosApi.deleteAuth(`${WsUrl.DELETE_FILE}?url=${optionDeleted.image}`)
        }
        var optionsClone = [...options]
        console.log('handleDeleteOption() optionsClone: ', optionsClone);
        optionsClone.splice(index, 1)
        console.log('handleDeleteOption() optionsClone splice: ', optionsClone);

        setOptions(optionsClone)
        setColorSelected([])
        setSizeSelected([])
    }

    const handleImportExcel = (e) => {
        const file = e.target.files[0];
        console.log('file -->', file);
        setSelectedFile(file);
        setFormData(formData.append('file', file));
        console.log(formData.length);
        fetch('http://localhost:8080/api/v1/product/import-excel', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((result) => {
                setOptions(result);
                // setColorSelected([{
                //     "id": "ae965d3b-b6b2-4e46-bb16-ddd798b6bbe4",
                //     "name": "Tím"
                // }])
                // setSizeSelected([])
                console.log('Success:', result);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const changeCountNumber = (e) => {
        setCountNumber(e.target.value)
    }

    const changeCountNumber2 = (e) => {
        setCountNumber2(e.target.value)
    }

    const changechoose = (e) => {
        setChoose(e.target.value)
    }

    const handleUpdate = () => {
        const optionUpdate = [...options]
        if (countNumber) {
            optionUpdate.forEach((items, idx) => {
                const item = { ...items, price: countNumber }
                optionUpdate[idx] = (item)
            })
        }
        if (countNumber2) {
            optionUpdate.forEach((items, idx) => {
                const item = { ...items, qty: countNumber2 }
                optionUpdate[idx] = (item)
            })
        }
        setOptions(optionUpdate)

        // if (choose) {
        //     optionUpdate.forEach((items, idx) => {
        //         const item = { ...items, image: choose }
        //         optionUpdate[idx] = (item)
        //     })
        // }
        // setOptions(optionUpdate)


    }



    console.log("options", options)
    return (
        <div className="container-fluid w-100 reponsive">
            <form className="card shadow mb-4" onSubmit={handleSubmit(handleSubmitForm)}>
                <div className="card-header py-3 d-flex align-items-center">
                    <Link to='/product' className=''><i className="fa fa-arrow-left" aria-hidden="true" /></Link>
                    <span className='mx-1'></span>
                    <h3 className="m-0 font-weight-bold text-primary">Thêm mới sản phẩm</h3>
                </div>
                {loading ? <HashSpinner /> :
                    <div className="row card-body d-flex">
                        <div className='col-10'>
                            <div className='form-group'>
                                <b><label htmlFor="" className="form-label">Tên sản phẩm<span className='text-danger'>*</span></label></b>
                                <input type="input" className="form-control py-3" {...register("name", { required: true, minLength: 4, maxLength: 100 })} />
                                {errors.name && <>
                                    {errors.name.type === 'required' && <span className='small text-danger'>Không được để trống</span>}
                                    {errors.name.type === 'minLength' && <span className='small text-danger'>Độ dài phải lớn hơn 4 ký tự</span>}
                                    {errors.name.type === 'maxLength' && <span className='small text-danger'>Độ dài phải nhỏ hơn 100 ký tự</span>} </>}
                            </div>
                            <div className='form-group'>
                                <b><label htmlFor="" className="form-label">Danh mục sản phẩm<span className='text-danger'>*</span></label></b>
                                <select className='form-control' {...register('categoryId')}>
                                    {categories && categories.map((obj, index) => (
                                        <option key={index} value={obj?.id}>{obj?.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='form-group'>
                                <b><label htmlFor="" className="form-label">Thương hiệu<span className='text-danger'>*</span></label></b>
                                <select className='form-control' {...register('brandId')}>
                                    {brands && brands.map((obj, index) => (
                                        <option key={index} value={obj?.id}>{obj?.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className='form-group'>
                                <b><label htmlFor="" className="form-label">Mô tả<span className='text-danger'>*</span></label></b>
                                <textarea className='form-control' rows={6} {...register('des', { required: true, minLength: 4 })}></textarea>
                                {errors.des &&
                                    <>
                                        {'required' === errors.des.type && <span className='small text-danger'>Không được để trống</span>}
                                        {'minLength' === errors.des.type && <span className='small text-danger'>Độ dài phải lớn hơn 4 ký tự</span>}
                                        {/* {'maxLength' === errors.des.type && <span className='small text-danger'>Độ dài phải nhỏ hơn 255 ký tự</span>} */}
                                    </>}
                            </div>

                            <div className='form-group'>
                                <b><label htmlFor="" className="form-label">Màu sắc<span className='text-danger'>*</span></label></b>
                                <WSSelected options={colors.map(o => ({ label: o.name, value: o.id }))} selected={colorSelected} setSelected={setColorSelected} />
                            </div>
                            <div className='form-group'>
                                <b><label htmlFor="" className="form-label">Size<span className='text-danger'>*</span></label></b>
                                <WSSelected options={sizes.map(o => ({ label: o.name, value: o.id }))} selected={sizeSelected} setSelected={setSizeSelected} />
                            </div>

                            <div className='row m-1'>
                                <div className='form-group m-2'>
                                    <input type="input" onChange={changeCountNumber2} value={countNumber2} placeholder='Nhập nhanh Giá tiền' />
                                </div>
                                <div className='form-group m-2'>
                                    <input onChange={changeCountNumber} type="input" value={countNumber} placeholder='Nhập nhanh số lượng' />
                                </div>
                                {/* <div className='form-group m-2'>
                                    <input className='form-control-file' type='file'  onChange={changechoose} value={choose}/>
                                </div> */}
                                <div className='form-group m-2'>
                                    <input
                                        type="file"
                                        accept=".jpg, .jpeg, .png, .xlsx"
                                        // value={selectedFile}
                                        onChange={(e) => handleImportExcel(e)}
                                    />
                                </div>
                            </div>

                            <div className='row m-2'>
                                <button type='button' onClick={handleGenerateOptions} className='btn btn-outline-primary m-2'>Tạo dữ liệu mẫu</button>
                                <button type='button' onClick={handleUpdate} className='btn btn-outline-primary m-2'>Cập nhật dữ liệu</button>
                            </div>
                            <div className='mt-2'>
                                <b><label htmlFor="" className="form-label">Phân loại<span className='text-danger'>*</span></label></b>

                                <div className='table-responsive'>
                                    <table className="table table-bordered" id="dataTable" width="100%" cellSpacing={0}>
                                        <thead>
                                            <tr>
                                                <th className='text-center' style={{ maxWidth: '40px' }}>#</th>
                                                <th className=''>Màu</th>
                                                <th className=''>Size</th>
                                                <th className=''>Đơn giá</th>
                                                <th className=''>Số lượng</th>
                                                <th className=''>Ảnh</th>
                                                <th className='text-center'>Xóa</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {options && options.map((obj, index) => (
                                                <tr key={index} className=''>
                                                    <td className='text-center' style={{ maxWidth: '40px' }}>{index + 1}</td>
                                                    <td className=''>{obj?.colorName}
                                                        <input className='form-control' hidden defaultValue={obj?.image} type='' {...register(`options.${index}.colorId`)} />
                                                    </td>
                                                    <td className=''>{obj?.sizeName}
                                                        <input className='form-control' hidden defaultValue={obj?.image} type='' {...register(`options.${index}.sizeId`)} />
                                                    </td>
                                                    <td className=''>
                                                        <input className='form-control' type='number' defaultValue={obj?.price} {...register(`options.${index}.price`)} onChange={handleChange('price', index)} />
                                                    </td>
                                                    <td className=''>
                                                        <input className='form-control' type='number' defaultValue={obj?.qty} {...register(`options.${index}.qty`)} onChange={handleChange('qty', index)} />
                                                    </td>
                                                    <td className='d-flex'>
                                                        <input className='form-control-file' type='file' multiple={false} accept="image/*" onChange={handleChange('image', index, true)} />
                                                        {obj?.image && <img src={obj?.image} style={{
                                                            objectFit: 'cover',
                                                            width: '80px',
                                                            height: '80px',
                                                            borderRadius: '50%'
                                                        }} />}
                                                        <input className='form-control' hidden defaultValue={obj?.image} type='' {...register(`options.${index}.image`)} />
                                                    </td>
                                                    <td className='text-center'>
                                                        <button type='button' className='btn btn-outline-danger' onClick={() => handleDeleteOption(index)}>
                                                            <i className="fa fa-trash fa-1x" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div>
                                        {options.length > 0 && <button type='button' onClick={handleResetOptions} className='btn btn-outline-danger mt-2'>Xóa dữ liệu mẫu</button>}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>}
                <div className="card-footer d-flex justify-content-eight">
                    <input disabled={disableBtn} type='submit' className='btn btn-primary mt-2 px-4' value={'Lưu'} />
                </div>
            </form>
        </div>
    )
}

export default CreateProductPage