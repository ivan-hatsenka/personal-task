import { LightningElement, wire } from 'lwc';
import { reduceErrors } from 'c/ldsUtils';
import getOrders from '@salesforce/apex/OrderController.getOrders';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import getOrderMonths from '@salesforce/apex/AccountController.getOrderMonths';

const columns = [
    {
        label: 'Order Name', 
        fieldName: 'orderUrl', 
        type: 'url', 
        typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' }
    },
    {
        label: 'Total Amount', 
        fieldName: 'Total_Amount__c', 
        type: 'number',
        cellAttributes: { alignment: 'left' } 
    },
    {
        label: 'Payment Due Date', 
        fieldName: 'Payment_Due_date__c', 
        type: 'date', 
    },
    {
        label: 'Account', 
        fieldName: 'accountUrl', 
        type: 'url', 
        typeAttributes: { label: { fieldName: 'accountName' }, target: '_blank' }
    }
];

const allMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];


export default class AccountRelatedOrders extends LightningElement {
    errorAccounts = [];
    errorMonths = [];
    errorOrders = [];
    orderData = [];
    accounts = [];
    selectedAccount;
    selectedMonth;
    months = [];
    orderColumns = columns;

    //Accounts
    @wire(getAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accounts = data.map(account => {
                return { value: account.Id, label: account.Name };
            });
            this.errorAccounts = [];
        } else if (error) {
            this.errorAccounts = reduceErrors(error);
            this.accounts = [];
        }
    }


    handleAccountChange(event) {
        this.selectedAccount = event.detail.value;
        this.selectedMonth = '';
    }

    //Month
    @wire(getOrderMonths, { accountId: '$selectedAccount' })
    wiredMonths({ error, data }) {
        if (data) {
            this.months = data.map(month => {
                return { value: month, label: allMonths[month - 1]  };
            });
            this.errorMonths = [];
        } else if (error) {
            this.errorMonths = reduceErrors(error);
            this.months = [];
        }
    }
    

    handleMonthChange(event) {
        this.selectedMonth = +event.detail.value;
    }

    //Records
    @wire(getOrders)
    wiredOrders({ error, data }) {
        if (data) {
            this.orderData = data.map(record => ({
                ...record,
                orderUrl: `/lightning/r/Order__c/${record.Id}/view`,
                accountUrl: `/lightning/r/Order__c/${record.Account__c}/view`,
                accountName: record.Account__r.Name
                
            }));
            this.errorOrders = [];
        } else if (error) {
            this.errorOrders = reduceErrors(error);
            this.orderData = undefined;
        }
    }

    get filteredOrderData() {
        return this.orderData.filter(order => {
            return (order.Account__c == this.selectedAccount && +order.Payment_Due_date__c.slice(5,7) == this.selectedMonth);
        });
        
    }

    //Errors
    get errors() {
        return this.errorAccounts.concat(this.errorMonths, this.errorOrders);
    }
}