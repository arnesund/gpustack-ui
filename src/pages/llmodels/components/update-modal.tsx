import LabelSelector from '@/components/label-selector';
import ModalFooter from '@/components/modal-footer';
import SealAutoComplete from '@/components/seal-form/auto-complete';
import FormItemWrapper from '@/components/seal-form/components/wrapper';
import SealInput from '@/components/seal-form/seal-input';
import SealSelect from '@/components/seal-form/seal-select';
import { PageAction } from '@/config';
import { PageActionType } from '@/config/types';
import { convertFileSize } from '@/utils';
import { InfoCircleOutlined, RightOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Checkbox, Collapse, Form, Modal, Tooltip, Typography } from 'antd';
import _ from 'lodash';
import { memo, useCallback, useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { queryHuggingfaceModelFiles, queryHuggingfaceModels } from '../apis';
import { modelSourceMap, placementStrategyOptions } from '../config';
import { FormData, ListItem } from '../config/types';
import dataformStyles from '../style/data-form.less';

type AddModalProps = {
  title: string;
  action: PageActionType;
  open: boolean;
  data?: ListItem;
  onOk: (values: FormData) => void;
  onCancel: () => void;
};

const sourceOptions = [
  {
    label: 'Hugging Face',
    value: modelSourceMap.huggingface_value,
    key: 'huggingface'
  },
  {
    label: 'Ollama Library',
    value: modelSourceMap.ollama_library_value,
    key: 'ollama_library'
  }
];

const UpdateModal: React.FC<AddModalProps> = (props) => {
  console.log('addmodel====');
  const { title, action, open, onOk, onCancel } = props || {};
  const [form] = Form.useForm();
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const modelSource = Form.useWatch('source', form);
  const wokerSelector = Form.useWatch('worker_selector', form);
  const [repoOptions, setRepoOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [fileOptions, setFileOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const initFormValue = () => {
    if (action === PageAction.CREATE && open) {
      form.setFieldsValue({
        source: modelSourceMap.huggingface_value,
        replicas: 1
      });
    }
    if (action === PageAction.EDIT && open) {
      form.setFieldsValue({
        ...props.data
      });
    }
  };

  useEffect(() => {
    initFormValue();
  }, [open]);

  const fileNamLabel = (item: any) => {
    return (
      <span>
        {item.path}
        <span
          style={{ color: 'var(--ant-color-text-tertiary)', marginLeft: '4px' }}
        >
          ({convertFileSize(item.size)})
        </span>
      </span>
    );
  };
  const handleFetchModelFiles = async (repo: string) => {
    try {
      setLoading(true);
      const res = await queryHuggingfaceModelFiles({ repo });
      const list = _.filter(res, (file: any) => {
        return _.endsWith(file.path, '.gguf');
      }).map((item: any) => {
        return {
          label: fileNamLabel(item),
          value: item.path,
          size: item.size
        };
      });
      setFileOptions(list);
      setLoading(false);
    } catch (error) {
      setFileOptions([]);
      setLoading(false);
    }
  };

  const handleRepoOnBlur = (e: any) => {
    const repo = form.getFieldValue('huggingface_repo_id');
    handleFetchModelFiles(repo);
  };

  const handleOnSearchRepo = async (text: string) => {
    try {
      const params = {
        search: {
          query: text,
          tags: ['gguf']
        }
      };
      const models = await queryHuggingfaceModels(params);
      const list = _.map(models || [], (item: any) => {
        return {
          ...item,
          value: item.name,
          label: item.name
        };
      });
      setRepoOptions(list);
    } catch (error) {
      setRepoOptions([]);
    }
  };

  const debounceSearch = _.debounce((text: string) => {
    handleOnSearchRepo(text);
  }, 300);

  const renderHuggingfaceFields = () => {
    return (
      <>
        <Form.Item<FormData>
          name="huggingface_repo_id"
          rules={[
            {
              required: true,
              message: intl.formatMessage(
                {
                  id: 'common.form.rule.input'
                },
                { name: intl.formatMessage({ id: 'models.form.repoid' }) }
              )
            }
          ]}
        >
          <SealInput.Input
            label={intl.formatMessage({ id: 'models.form.repoid' })}
            required
            disabled={true}
          ></SealInput.Input>
        </Form.Item>
        <Form.Item<FormData>
          name="huggingface_filename"
          rules={[
            {
              required: true,
              message: intl.formatMessage(
                {
                  id: 'common.form.rule.input'
                },
                { name: intl.formatMessage({ id: 'models.form.filename' }) }
              )
            }
          ]}
        >
          <SealAutoComplete
            filterOption
            label={intl.formatMessage({ id: 'models.form.filename' })}
            required
            options={fileOptions}
            loading={loading}
            onFocus={handleRepoOnBlur}
            disabled={action === PageAction.EDIT}
          ></SealAutoComplete>
        </Form.Item>
      </>
    );
  };

  const renderS3Fields = () => {
    return (
      <>
        <Form.Item<FormData>
          name="s3_address"
          rules={[
            {
              required: true,
              message: intl.formatMessage(
                {
                  id: 'common.form.rule.input'
                },
                { name: intl.formatMessage({ id: 'models.form.s3address' }) }
              )
            }
          ]}
        >
          <SealInput.Input
            label={intl.formatMessage({
              id: 'models.form.s3address'
            })}
            required
          ></SealInput.Input>
        </Form.Item>
      </>
    );
  };

  const renderOllamaModelFields = () => {
    return (
      <>
        <Form.Item<FormData>
          name="ollama_library_model_name"
          rules={[
            {
              required: true,
              message: intl.formatMessage(
                {
                  id: 'common.form.rule.input'
                },
                { name: intl.formatMessage({ id: 'models.table.name' }) }
              )
            }
          ]}
        >
          <SealInput.Input
            disabled={action === PageAction.EDIT}
            label={intl.formatMessage({ id: 'model.form.ollama.model' })}
            placeholder={intl.formatMessage({ id: 'model.form.ollamaholder' })}
            required
          ></SealInput.Input>
        </Form.Item>
      </>
    );
  };

  const renderFieldsBySource = () => {
    switch (modelSource) {
      case modelSourceMap.huggingface_value:
        return renderHuggingfaceFields();
      case modelSourceMap.ollama_library_value:
        return renderOllamaModelFields();
      case modelSourceMap.s3_value:
        return renderS3Fields();
      default:
        return null;
    }
  };

  const handleWorkerLabelsChange = useCallback(
    (labels: Record<string, any>) => {
      console.log('labels========', labels);
      form.setFieldValue('worker_selector', labels);
    },
    []
  );

  const handleOnSelectModel = useCallback((item: any) => {
    const repo = item.name;
    if (form.getFieldValue('source') === modelSourceMap.huggingface_value) {
      form.setFieldValue('huggingface_repo_id', repo);
      handleFetchModelFiles(repo);
    } else {
      form.setFieldValue('ollama_library_model_name', repo);
    }
  }, []);

  const handleSourceChange = useCallback((value: string) => {
    form.setFieldValue('source', value);
  }, []);

  const handleSumit = () => {
    form.submit();
  };

  const collapseItems = [
    {
      key: '1',
      label: (
        <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
          {intl.formatMessage({ id: 'resources.form.advanced' })}
        </span>
      ),
      children: (
        <>
          <Form.Item<FormData>
            name="replicas"
            rules={[
              {
                required: true,
                message: intl.formatMessage(
                  {
                    id: 'common.form.rule.input'
                  },
                  {
                    name: intl.formatMessage({ id: 'models.form.replicas' })
                  }
                )
              }
            ]}
          >
            <SealInput.Number
              style={{ width: '100%' }}
              label={intl.formatMessage({
                id: 'models.form.replicas'
              })}
              required
              min={0}
            ></SealInput.Number>
          </Form.Item>
          <Form.Item<FormData> name="placement_strategy">
            <SealSelect
              label={intl.formatMessage({
                id: 'resources.form.placementStrategy'
              })}
              options={placementStrategyOptions}
              description={
                <div>
                  <div className="m-b-8">
                    <Typography.Title
                      level={5}
                      style={{
                        color: 'var(--color-white-1)',
                        marginRight: 10
                      }}
                    >
                      Spread:
                    </Typography.Title>
                    <Typography.Text style={{ color: 'var(--color-white-1)' }}>
                      {intl.formatMessage({
                        id: 'resources.form.spread.tips'
                      })}
                    </Typography.Text>
                  </div>
                  <div>
                    <Typography.Title
                      level={5}
                      style={{ color: 'var(--color-white-1)', marginRight: 10 }}
                    >
                      Binpack:
                    </Typography.Title>
                    <Typography.Text style={{ color: 'var(--color-white-1)' }}>
                      {intl.formatMessage({
                        id: 'resources.form.binpack.tips'
                      })}
                    </Typography.Text>
                  </div>
                </div>
              }
            ></SealSelect>
          </Form.Item>
          <div style={{ marginBottom: 24 }}>
            <FormItemWrapper noWrapperStyle>
              <Form.Item<FormData>
                name="partial_offload"
                valuePropName="checked"
                style={{ padding: '0 10px', marginBottom: 0 }}
              >
                <Checkbox>
                  <Tooltip
                    title={intl.formatMessage({
                      id: 'models.form.partialoffload.tips'
                    })}
                  >
                    <span style={{ color: 'var(--ant-color-text-tertiary)' }}>
                      {intl.formatMessage({
                        id: 'resources.form.enablePartialOffload'
                      })}
                    </span>
                    <InfoCircleOutlined
                      className="m-l-4"
                      style={{ color: 'var(--ant-color-text-tertiary)' }}
                    />
                  </Tooltip>
                </Checkbox>
              </Form.Item>
            </FormItemWrapper>
          </div>
          <div style={{ marginBottom: 24 }}>
            <FormItemWrapper noWrapperStyle>
              <Form.Item<FormData>
                name="distributed_inference_across_workers"
                valuePropName="checked"
                style={{ padding: '0 10px', marginBottom: 0 }}
              >
                <Checkbox>
                  <Tooltip
                    title={intl.formatMessage({
                      id: 'models.form.distribution.tips'
                    })}
                  >
                    <span style={{ color: 'var(--ant-color-text-tertiary)' }}>
                      {intl.formatMessage({
                        id: 'resources.form.enableDistributedInferenceAcrossWorkers'
                      })}
                    </span>
                    <InfoCircleOutlined
                      className="m-l-4"
                      style={{ color: 'var(--ant-color-text-tertiary)' }}
                    />
                  </Tooltip>
                </Checkbox>
              </Form.Item>
            </FormItemWrapper>
          </div>
          <Form.Item<FormData> name="worker_selector">
            <LabelSelector
              label={intl.formatMessage({
                id: 'resources.form.workerSelector'
              })}
              labels={form.getFieldValue('worker_selector')}
              onChange={handleWorkerLabelsChange}
              description={
                <span>
                  {intl.formatMessage({
                    id: 'resources.form.workerSelector.description'
                  })}
                </span>
              }
            ></LabelSelector>
          </Form.Item>
        </>
      )
    }
  ];

  return (
    <Modal
      title={title}
      open={open}
      centered={true}
      onOk={handleSumit}
      onCancel={onCancel}
      destroyOnClose={true}
      closeIcon={true}
      maskClosable={false}
      keyboard={false}
      width={600}
      styles={{
        content: {
          padding: '0px'
        },
        header: {
          padding: 'var(--ant-modal-content-padding)',
          paddingBottom: '0'
        },
        body: {
          padding: '0'
        },
        footer: {
          padding: '0 var(--ant-modal-content-padding)'
        }
      }}
      footer={
        <ModalFooter onCancel={onCancel} onOk={handleSumit}></ModalFooter>
      }
    >
      <SimpleBar
        style={{
          maxHeight: '550px'
        }}
      >
        <Form
          name="addModalForm"
          form={form}
          onFinish={onOk}
          preserve={false}
          style={{
            padding: 'var(--ant-modal-content-padding)',
            paddingBlock: 0
          }}
        >
          <Form.Item<FormData>
            name="name"
            rules={[
              {
                required: true,
                message: intl.formatMessage(
                  {
                    id: 'common.form.rule.input'
                  },
                  { name: intl.formatMessage({ id: 'common.table.name' }) }
                )
              }
            ]}
          >
            <SealInput.Input
              label={intl.formatMessage({
                id: 'common.table.name'
              })}
              required
            ></SealInput.Input>
          </Form.Item>
          <Form.Item<FormData>
            name="source"
            rules={[
              {
                required: true,
                message: intl.formatMessage(
                  {
                    id: 'common.form.rule.select'
                  },
                  { name: intl.formatMessage({ id: 'models.form.source' }) }
                )
              }
            ]}
          >
            {action === PageAction.EDIT && (
              <SealSelect
                disabled={true}
                label={intl.formatMessage({
                  id: 'models.form.source'
                })}
                options={sourceOptions}
                required
              ></SealSelect>
            )}
          </Form.Item>
          {renderFieldsBySource()}
          <Form.Item<FormData> name="description">
            <SealInput.TextArea
              label={intl.formatMessage({
                id: 'common.table.description'
              })}
            ></SealInput.TextArea>
          </Form.Item>
          <Collapse
            expandIconPosition="start"
            bordered={false}
            ghost
            className={dataformStyles['advanced-collapse']}
            expandIcon={({ isActive }) => (
              <RightOutlined
                rotate={isActive ? 90 : 0}
                style={{ fontSize: '12px' }}
              />
            )}
            items={collapseItems}
          ></Collapse>
        </Form>
      </SimpleBar>
    </Modal>
  );
};

export default memo(UpdateModal);
