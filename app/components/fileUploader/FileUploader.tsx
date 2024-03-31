'use client'

import React from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CancelIcon from '@mui/icons-material/Cancel'
import { Grid } from '@mui/material'

type Props = {
    images: File[]
    setImages: (arg: File[]) => void
}

export default function FileUploader ({ images, setImages }: Props) {
    const maxImagesUpload = 1
    const inputId = Math.random().toString(32).substring(2)

    const handleOnAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const fileList: FileList = e.target.files;
        const files = Array.from(fileList);

        setImages([...images, ...files])
        e.target.value = ''
    }

    const handleOnRemoveImage = (index: number) => {
        const newImages = [...images]
        newImages.splice(index, 1)
        setImages(newImages)
    }

    return (
        <>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 8, sm: 12, md: 12 }}>
                {images.map((image, i) => (
                    <Grid
                        item
                        xs={4}
                        sm={4}
                        md={4}
                        key={i}
                        sx={{
                            display: 'flex',
                            justifyContent: 'start',
                            alignItems: 'center',
                            position: 'relative'
                        }}
                    >
                        <IconButton
                            aria-label='delete image'
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 0,
                                color: '#aaa'
                            }}
                            onClick={() => handleOnRemoveImage(i)}
                        >
                            <CancelIcon />
                        </IconButton>
                        <img
                            src={URL.createObjectURL(image)}
                            aria-label={`estate image ${i}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                aspectRatio: '1 / 1'
                            }}
                            alt=''
                        />
                    </Grid>
                ))}
            </Grid>
            <label htmlFor={inputId}>
                <Button variant='outlined' disabled={images.length >= maxImagesUpload} component='label' sx={{ mt: 4 }}>
                    画像をアップロード
                    <input
                        id={inputId}
                        type='file'
                        accept='image/*,.png,.jpg,.jpeg,.gif'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOnAddImage(e)}
                        style={{ display: 'none' }}
                    />
                </Button>
            </label>
        </>
    )
}