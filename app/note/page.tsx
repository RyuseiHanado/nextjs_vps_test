'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Card, Row, Col, Input, Button, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import axios from "axios";
import FileUploader from '@/app/components/fileUploader/FileUploader';

interface DataType {
    key: string;
    id: number;
    content: string;
    createdAt: string;
    imageKey: string;
}

type FileList = {
    imageKey: string,
    data: string
}

export default function Home() {
    const [content, setContent] = useState('');
    const [dataSource, setDataSource] = useState<DataType[]>([]);
    const [uploadImageList, setUploadImageList] = useState<File[]>([])
    const [downloadImageList, setDownloadImageList] = useState<FileList[]>()

    useEffect(() => {
        const fetchNotes = async () => {
            const response = await fetch('/api/notes');
            const notes = await response.json();
            setDataSource(notes);
        };
        fetchNotes();
    }, []);

    useEffect( () => {
        if (dataSource.length === 0) return
        const fetchImage = async () => {
            const list: FileList[] = []
            await Promise.all(dataSource.map(async note => {
                if (note.imageKey) {
                    const searchParams = new URLSearchParams()
                    searchParams.append('key', note.imageKey)
                    await axios.get(`/api/image?${searchParams}`,
                        {responseType: 'blob',}
                    )
                    .then(res => {
                        list.push({imageKey: note.imageKey, data: URL.createObjectURL(res.data)})
                    })
                }
            }))
            setDownloadImageList(list)
        }
        fetchImage()
    }, [dataSource]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setContent(event.target.value);
    };

    const handleSaveClick = async () => {
        const formData = new FormData()
        formData.append('content', content)
        if (uploadImageList.length !== 0) {
            const image = uploadImageList[0]
            formData.append('image', image)
        }
        const response = await fetch('/api/notes', {
            method: 'POST',
            body: formData,
        });

        const notes = await response.json();
        setDataSource(notes);

        setContent('');
    };

    const handleDeleteClick = async (id: number) => {
        const response = await fetch(`/api/notes?id=${id}`, {
            method: 'DELETE',
        });

        const notes = await response.json();
        setDataSource(notes);
    };

    const columns: ColumnsType<DataType> = [
        {
            title: '作成日時',
            dataIndex: 'createdAt',
            width: '20%',
            render: (date: Date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
        },
        {
            title: '内容',
            dataIndex: 'content',
            width: '35%',
        },
        {
            title: '画像',
            dataIndex: 'imageKey',
            width: '30%',
            render: imageKey =>　downloadImageList && downloadImageList.some(file => file.imageKey === imageKey) ? <img alt={''} src={downloadImageList[downloadImageList.findIndex(file => file.imageKey === imageKey)].data} width="50" /> : ''
        },
        {
            width: '5%',
            render: (record: DataType) => (
                <Button danger onClick={() => handleDeleteClick(record.id)}>
                    削除
                </Button>
            ),
        },
    ];

    const centeredStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    };

    return (
        <div style={centeredStyle}>
            <Card title='ノート' style={{ width: 800 }}>
                <div>
                    {/*<img alt={''} src={file} width="500" />*/}
                </div>
                <Row>
                    <Col span={16}>
                        <Input
                            placeholder='内容を記述'
                            value={content}
                            onChange={handleInputChange}
                        />
                    </Col>
                    <Col>
                        <FileUploader images={uploadImageList} setImages={setUploadImageList}/>
                    </Col>
                    <Col span={7} offset={1}>
                        <Button type='primary' onClick={handleSaveClick}>
                            保存
                        </Button>
                    </Col>
                </Row>
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    rowKey={(record) => record.id}
                    pagination={{
                        pageSize: 5,
                    }}
                    style={{ marginTop: 20 }}
                />
            </Card>
        </div>
    );
}