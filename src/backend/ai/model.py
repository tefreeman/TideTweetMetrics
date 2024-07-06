from transformers import BertPreTrainedModel, BertModel
import torch.nn as nn
import torch


# Bert model class with additional features
# This class is a modified version of the BertForSequenceClassification class
# that includes additional features in the input and the classifier layer.
# It now outputs a single value instead of classification probabilities.
# May need to rework this if we have time for better analysis

class EnhancedBertForSequenceRegression(BertPreTrainedModel):
    def __init__(self, config, num_additional_features=11, intermediate_size=256):
        super().__init__(config)
        self.bert = BertModel(config)

        total_input_size = config.hidden_size + num_additional_features
        self.dropout = nn.Dropout(config.hidden_dropout_prob)
        self.classifier = (nn.Linear(total_input_size, 1))
        # self.classifier = nn.Sequential(
        #     nn.Linear(total_input_size, intermediate_size),
        #     nn.ReLU(), # Forces non negative output
        #     nn.Linear(intermediate_size, 1)
        # )

    def forward(self, input_ids, attention_mask=None, token_type_ids=None, position_ids=None, head_mask=None, inputs_embeds=None, additional_features=None):
        if additional_features is None:
            raise ValueError("additional_features must be provided to the CustomBertModel.")
        outputs = self.bert(input_ids,
                            attention_mask=attention_mask,
                            token_type_ids=token_type_ids,
                            position_ids=position_ids,
                            head_mask=head_mask,
                            inputs_embeds=inputs_embeds)
        pooled_output = outputs[1]
        pooled_output = torch.cat((pooled_output, additional_features), 1)
        pooled_output = self.dropout(pooled_output)
        logits = self.classifier(pooled_output)
        return logits.squeeze()  # Remove the extra dimension


